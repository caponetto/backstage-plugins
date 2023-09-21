import { Git } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import { ScmIntegrations } from '@backstage/integration';

import { Octokit } from 'octokit';
import { Logger } from 'winston';

export class GithubService {
  private readonly octokit: Octokit;

  private readonly git: Git;

  private readonly logger: Logger;

  private readonly author = {
    name: 'author',
    email: 'test@backstage.io',
  };

  private readonly committer = {
    name: 'comitter',
    email: 'test@backstage.io',
  };

  constructor(logger: Logger, config: Config) {
    this.logger = logger;
    const githubIntegration = ScmIntegrations.fromConfig(config)
      .github.list()
      .pop();
    this.octokit = new Octokit({
      auth: githubIntegration?.config.token,
      baseUrl: githubIntegration?.config.apiBaseUrl,
    });
    this.git = Git.fromAuth({
      token: githubIntegration?.config.token,
    });
  }

  async clone(repoURL: string, localPath: string): Promise<void> {
    this.logger.info(`cloning repo ${repoURL} into ${localPath}`);
    return this.git.clone({
      url: repoURL,
      dir: localPath,
      depth: 1,
    });
  }

  async push(dir: string, message: string): Promise<void> {
    const force = true;
    const remote = 'origin';
    const filepath = '.';
    this.git
      .add({ dir, filepath })
      .then(() =>
        this.git.commit({
          dir,
          message,
          author: this.author,
          committer: this.committer,
        }),
      )
      .then(() => this.git.push({ dir, remote, force }))
      .then(() => this.logger.info('push '))
      .catch(ex => this.logger.error(ex));
  }

  async pull(localPath: string): Promise<void> {
    const branch: string = 'origin/main';
    this.git
      .fetch({ remote: `origin`, dir: localPath })
      .then(() =>
        this.git.merge({
          dir: localPath,
          theirs: branch,
          author: this.author,
          committer: this.committer,
        }),
      )
      .then(() => this.logger.info('merged !'))
      .catch(ex => this.logger.error(ex));
  }
}
