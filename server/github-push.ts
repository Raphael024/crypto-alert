import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function createAndPushRepo() {
  try {
    console.log('Initializing GitHub client...');
    const octokit = await getUncachableGitHubClient();
    
    // Get authenticated user
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`Authenticated as: ${user.login}`);
    
    const repoName = 'crypto-buzz';
    
    // Check if repo exists
    let repoExists = false;
    try {
      await octokit.repos.get({
        owner: user.login,
        repo: repoName,
      });
      repoExists = true;
      console.log(`Repository ${repoName} already exists`);
    } catch (error: any) {
      if (error.status === 404) {
        console.log(`Repository ${repoName} does not exist, creating...`);
      } else {
        throw error;
      }
    }
    
    // Create repo if it doesn't exist
    if (!repoExists) {
      const { data: repo } = await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description: 'Premium cryptocurrency tracking PWA with real-time prices, alerts, and news',
        private: false,
        auto_init: false,
      });
      console.log(`Repository created: ${repo.html_url}`);
      console.log(`Clone URL: ${repo.clone_url}`);
      
      return {
        success: true,
        repoUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        owner: user.login,
        repo: repoName,
        message: 'Repository created successfully! Use git commands to push your code.',
      };
    } else {
      const repoUrl = `https://github.com/${user.login}/${repoName}`;
      const cloneUrl = `https://github.com/${user.login}/${repoName}.git`;
      
      return {
        success: true,
        repoUrl,
        cloneUrl,
        owner: user.login,
        repo: repoName,
        message: 'Repository already exists. Use git commands to push your code.',
      };
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    throw error;
  }
}

createAndPushRepo()
  .then(result => {
    console.log('\n=== GitHub Repository Ready ===');
    console.log(`Repository URL: ${result.repoUrl}`);
    console.log(`Clone URL: ${result.cloneUrl}`);
    console.log('\nNext steps:');
    console.log('1. Initialize git: git init');
    console.log('2. Add remote: git remote add origin ' + result.cloneUrl);
    console.log('3. Add files: git add -A');
    console.log('4. Commit: git commit -m "Initial commit"');
    console.log('5. Push: git push -u origin main');
    console.log('\nNote: You may need to configure git credentials or use a personal access token.');
  })
  .catch(error => {
    console.error('Failed to create repository:', error.message);
    process.exit(1);
  });
