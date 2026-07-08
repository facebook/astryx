// flow-typed signature: 6103021a6389a42ea8b41c577b3f91b3
// flow-typed version: 79dc43986b/@octokit/rest_v18.x.x/flow_>=v0.83.x

declare module '@octokit/rest' {
  /**
   * Octokit-specific request options which are ignored for the actual request, but can be used by Octokit or plugins to manipulate how the request is sent or how a response is handled
   */
  declare type RequestRequestOptions = {|
    /**
     * Node only. Useful for custom proxy, certificate, or dns lookup.
     *
     * @see https://nodejs.org/api/http.html#http_class_http_agent
     */
    agent?: mixed,
    /**
     * Custom replacement for built-in fetch method. Useful for testing or request hooks.
     */
    fetch?: any,
    /**
     * Use an `AbortController` instance to cancel a request. In node you can only cancel streamed requests.
     */
    signal?: any,
    /**
     * Node only. Request/response timeout in ms, it resets on redirect. 0 to disable (OS limit applies). `options.request.signal` is recommended instead.
     */
    timeout?: number,
    [option: string]: any,
  |};

  declare class Octokit {
    constructor(options?: {|
      authStrategy?: any,
      auth?: any,
      userAgent?: string,
      previews?: Array<string>,
      baseUrl?: string,
      log?: {|
        debug?: (message: string) => mixed;
        info?: (message: string) => mixed;
        warn?: (message: string) => mixed;
        error?: (message: string) => mixed;
      |},
      request?: RequestRequestOptions,
      timeZone?: string,
      [option: string]: any,
    |}): this;

    static VERSION: string;

    actions: {| [key: string]: any |},
    activity: {| [key: string]: any |},
    apps: {| [key: string]: any |},
    auth: (...args: Array<any>) => Promise<{| [key: string]: any |}>,
    billing: {| [key: string]: any |},
    checks: {| [key: string]: any |},
    codeScanning: {| [key: string]: any |},
    codesOfConduct: {| [key: string]: any |},
    emojis: {| [key: string]: any |},
    enterpriseAdmin: {| [key: string]: any |},
    gists: {| [key: string]: any |},
    git: {| [key: string]: any |},
    gitignore: {| [key: string]: any |},
    graphql: (...args: Array<any>) => any,
    hook: (...args: Array<any>) => any,
    interactions: {| [key: string]: any |},
    issues: {| [key: string]: any |},
    licenses: {| [key: string]: any |},
    log:{| [key: string]: any |},
    markdown: {| [key: string]: any |},
    meta: {| [key: string]: any |},
    migrations: {| [key: string]: any |},
    orgs: {| [key: string]: any |},
    packages: {| [key: string]: any |},
    paginate: (...args: Array<any>) => any,
    projects: {| [key: string]: any |},
    pulls: {| [key: string]: any |},
    rateLimit: {| [key: string]: any |},
    reactions: {| [key: string]: any |},
    repos: {
      getContent: ({|
        owner: string,
        repo: string,
        path?: string,
        ref?: string,
      |}) => Promise<{|
        headers: {| [key: string]: any |},
        status: number,
        url: string,
        data: Array<{|
          download_url: any,
          git_url: string,
          html_url: string,
          name: string,
          path: string,
          sha: string,
          size: number,
          type: string,
          url: string,
          _links: {|
            git: string,
            html: string,
            self: string,
          |}
        |}>,
      |}>,
      /**
       * This returns a list of releases, which does not include regular Git tags that have not been associated with a release. To get a list of Git tags, use the Repository Tags API.
       *
       * Information about published releases are available to everyone. Only users with push access will receive listings for draft releases.
       */
      listReleases: ({|
        /**
         * The account owner of the repository. The name is not case sensitive.
         */
        owner: string,
        /**
         * The name of the repository. The name is not case sensitive.
         */
        repo: string,
        /**
         * The number of results per page (max 100).
         */
        page?: number,
        /**
         * Page number of the results to fetch.
         */
        per_page?: number,
      |}) => Promise<{|
        headers: {| [key: string]: any |},
        status: number,
        url: string,
        data: Array<{|
          url: string,
          assets_url: string,
          upload_url: string,
          html_url: string,
          id: number,
          author: {|
            login: string,
            id: number,
            node_id: string,
            avatar_url: string,
            gravatar_id: string,
            url: string,
            html_url: string,
            followers_url: string,
            following_url: string,
            gists_url: string,
            starred_url: string,
            subscriptions_url: string,
            organizations_url: string,
            repos_url: string,
            events_url: string,
            received_events_url: string,
            type: string,
            site_admin: boolean,
          |},
          node_id: string,
          tag_name: string,
          target_commitish: string,
          name: any,
          draft: boolean,
          prerelease: boolean,
          created_at: string,
          published_at: string,
          assets: Array<any>,
          tarball_url: string,
          zipball_url: string,
          body: string,
        |}>,
      |}>,
      [key: string]: any,
    },
    request: (...args: Array<any>) => any,
    rest: {| [key: string]: any |},
    search: {| [key: string]: any |},
    secretScanning: {| [key: string]: any |},
    teams: {| [key: string]: any |},
    users: {| [key: string]: any |},
  }

  declare module.exports: {|
    Octokit: typeof Octokit,
  |};
}
