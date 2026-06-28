// Better Auth uses cookie-based session management, so manual header injection is not needed here.
interface Repo {
  id: string;
  full_name: string;
  html_url: string;
  description: string;
}

interface Deployment {
  id: string;
  projectName: string;
  repoFullName: string;
  commitHash: string;
  branch: string;
  status: string;
  duration: string;
  timestamp: string;
  subdomain: string;
  runtime: string;
}

const baseURL = import.meta.env.VITE_API_URL;

const buildUrl = (path: string) => `${baseURL}${path}`;

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(`Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const parseResponseBody = async (response: Response) => {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

const handleError = async (response: Response) => {
  const data = await parseResponseBody(response).catch(() => undefined);

  switch (response.status) {
    case 400:
      console.error(data);
      break;

    case 401:
      console.error("unauthorised");
      break;

    case 404:
      console.error("/not-found");
      break;

    case 500:
      console.error("/server-error");
      break;
  }

  throw new ApiError(response.status, data);
};

const requestJson = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<T> => {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    await handleError(response);
  }

  return parseResponseBody(response) as Promise<T>;
};

const request = {
  get: <T>(url: string) => requestJson<T>(url),
  post: <T>(url: string, body: object) =>
    requestJson<T>(url, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  delete: <T>(url: string) =>
    requestJson<T>(url, {
      method: "DELETE",
    }),
};

interface GitHubRepo {
  id: string;
  full_name: string;
  description: string;
  html_url: string;
  default_branch: string;
  private: boolean;
  language: string | null;
  updated_at: string;
}

const getRepos = {
  list: () => request.get<{ repos: Repo[] }>("/repos").then((res) => res.repos),
  details: (id: string) => request.get<Repo>(`/repos/${id}`),
  github: () =>
    request
      .get<{ repos: GitHubRepo[] }>("/github/repos")
      .then((res) => res.repos),
};

const deploy = {
  injectWorkflow: (data: {
    repoFullName: string;
    runtime: string;
    branch: string;
  }) => request.post<{ buildId: string }>("/inject-workflow", data),
  create: (data: { image: string; subdomain: string; repo?: string }) =>
    request.post<Deployment>("/deploy", data),
  list: () =>
    request
      .get<{ deployments: Deployment[] }>("/deployments")
      .then((res) => res.deployments),
  get: (id: string) =>
    request
      .get<{ deployment: Deployment }>(`/deployments/${id}`)
      .then((res) => res.deployment),
  delete: (id: string) =>
    request.delete<{ success: boolean }>(`/deployments/${id}`),
};

const api = {
  getRepos,
  deploy,
};

export default api;
