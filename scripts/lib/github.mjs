// Pulls live profile stats. Falls back to the last good snapshot (data/stats.json)
// so a flaky API call never breaks the profile.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const CACHE = new URL('../../data/stats.json', import.meta.url);
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

async function gh(path, init = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'material-profile-generator',
      ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${path}: ${res.status} ${res.statusText}`);
  return res.json();
}

async function contributions(login) {
  if (!TOKEN) return null; // GraphQL needs a token
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
  const json = await gh('/graphql', { method: 'POST', body: JSON.stringify({ query, variables: { login } }) });
  if (json.errors) throw new Error(json.errors.map((e) => e.message).join('; '));
  const cal = json.data.user.contributionsCollection.contributionCalendar;
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) streak++;
    else if (i === days.length - 1) continue; // today may not have activity yet
    else break;
  }
  return { total: cal.totalContributions, last7: days.slice(-7), streak };
}

export async function fetchStats(cfg) {
  const login = cfg.username;
  const user = await gh(`/users/${login}`);
  const repos = (await gh(`/users/${login}/repos?per_page=100&type=owner&sort=pushed`)).filter((r) => !r.fork);

  const langBytes = {};
  await Promise.all(repos.map(async (r) => {
    const langs = await gh(`/repos/${login}/${r.name}/languages`);
    for (const [k, v] of Object.entries(langs)) langBytes[k] = (langBytes[k] || 0) + v;
  }));

  const featuredName = cfg.featured?.repo || repos.slice().sort((a, b) => b.stargazers_count - a.stargazers_count)[0]?.name;
  const featured = featuredName ? await gh(`/repos/${login}/${featuredName}`) : null;

  return {
    fetchedAt: new Date().toISOString(),
    login: user.login,
    name: user.name,
    publicRepos: user.public_repos,
    ownRepos: repos.length,
    followers: user.followers,
    stars: repos.reduce((s, r) => s + r.stargazers_count, 0),
    languages: langBytes,
    contributions: await contributions(login),
    featured: featured && {
      name: featured.name,
      fullName: featured.full_name,
      description: featured.description || '',
      stars: featured.stargazers_count,
      forks: featured.forks_count,
      language: featured.language,
      url: featured.html_url,
    },
  };
}

export async function loadStats(cfg, { offline = false } = {}) {
  const cached = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : null;
  if (offline) {
    if (!cached) throw new Error('No cached stats in data/stats.json; run once without --offline.');
    return cached;
  }
  try {
    const fresh = await fetchStats(cfg);
    if (!fresh.contributions && cached?.contributions) fresh.contributions = cached.contributions;
    mkdirSync(new URL('./', CACHE), { recursive: true });
    writeFileSync(CACHE, JSON.stringify(fresh, null, 2) + '\n');
    return fresh;
  } catch (err) {
    if (!cached) throw err;
    console.warn(`! ${err.message}\n! Using cached stats from ${cached.fetchedAt}`);
    return cached;
  }
}
