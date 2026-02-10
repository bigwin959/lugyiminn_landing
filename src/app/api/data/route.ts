import { NextResponse } from "next/server";

const REPO_OWNER = 'bigwin959';
const REPO_NAME = 'lugyiminn_landing';
const BRANCH = 'main';
const DATA_FILE_PATH = 'src/data.json';

// Helper function to get file SHA (needed for updates)
async function getFileSha(token: string) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE_PATH}`;
  const response = await fetch(url, {
    headers: { 'Authorization': `token ${token}` }
  });
  if (response.ok) {
    const data = await response.json();
    return data.sha;
  }
  return null;
}

export async function GET() {
  try {
    // Fetch raw content directly from GitHub to ensure we get the latest committed version
    // Using raw.githubusercontent.com might have caching, using API is better for freshness if token is available
    // But for public read, maybe raw is okay? No, let's use API to be safe if it's private or to get fresh data.
    // Actually, to avoid rate limits on public IP, let's try to use the token if available.

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    let url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${DATA_FILE_PATH}`;
    let headers: HeadersInit = {};

    if (GITHUB_TOKEN) {
      // Use API if token exists for better freshness and to avoid caching issues of raw.githubusercontent
      url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE_PATH}`;
      headers = {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3.raw' // Request raw content
      };
    }

    const response = await fetch(url, { headers, cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    // Fallback to local file if fetch fails (e.g. during build or local dev without internet)
    // transforming fs read to a fallback is complex here, let's just return error or default
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ success: false, error: 'GITHUB_TOKEN missing' }, { status: 500 });
    }

    const sha = await getFileSha(GITHUB_TOKEN);
    const contentBase64 = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE_PATH}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Update data.json via Admin Panel',
        content: contentBase64,
        sha: sha, // Required for updating existing files
        branch: BRANCH,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API Error:', errorData);
      throw new Error(`GitHub API Error: ${response.statusText}`);
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
