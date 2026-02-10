
import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaYoutube, FaTiktok, FaTelegram, FaLine, FaFacebookMessenger, FaViber, FaShareAlt } from "react-icons/fa";
import styles from "./page.module.css";
import fs from "fs";
import path from "path";

type Button = {
  id: string;
  label: string;
  url: string;
  color?: string;
};

type Data = {
  logo: string;
  affiliateButton?: {
    label: string;
    url: string;
    enabled: boolean;
  };
  mainButtons: Button[];
  socials: { id: string; url: string; active: boolean }[];
};

async function getData(): Promise<Data> {
  const REPO_OWNER = 'bigwin959';
  const REPO_NAME = 'lugyiminn_landing';
  const BRANCH = 'main';
  const DATA_FILE_PATH = 'src/data.json';

  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    // Default fallback data (in case of fetch failure)
    const defaultData = {
      logo: "/uploads/logo.png",
      mainButtons: [],
      socials: []
    };

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

    // Force no-store to avoid caching
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 } // Next.js specific revalidation
    });

    if (!response.ok) {
      console.error(`Failed to fetch data from GitHub: ${response.statusText}`);
      return defaultData;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      logo: "/uploads/logo.png",
      mainButtons: [],
      socials: []
    };
  }
}

export default async function Home() {
  const data = await getData();

  // Helper for social colors
  const getSocialColor = (id: string) => {
    switch (id) {
      case 'facebook': return '#1877F2';
      case 'youtube': return '#FF0000';
      case 'tiktok': return '#000000'; // Tiktok gradient is complex, simplified to black/dark
      case 'telegram': return '#2AABEE';
      default: return '#333';
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Logo/Banner Section */}
        <div className={styles.logoSection}>
          {data.logo ? (
            <Image
              src={data.logo}
              alt="Banner"
              fill
              className={styles.bannerImage}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#333' }} />
          )}
        </div>

        {/* Affiliate / Promo Button */}
        {data.affiliateButton && data.affiliateButton.enabled && (
          <Link
            href={data.affiliateButton.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.affiliateButton}
          >
            <span style={{ fontSize: '1rem', marginRight: '5px' }}>🔥</span>
            <span>{data.affiliateButton.label}</span>
            <span style={{ fontSize: '1rem', marginLeft: '5px' }}>🔥</span>
          </Link>
        )}

        {/* Main Action Buttons */}
        <div className={styles.buttonGrid}>
          {data.mainButtons.map((btn) => {
            // Determine icon based on ID or Label
            let Icon = null;
            const lowerId = btn.id.toLowerCase();
            const lowerLabel = btn.label.toLowerCase();

            if (lowerId.includes('telegram') || lowerLabel.includes('telegram')) Icon = FaTelegram;
            else if (lowerId.includes('line') || lowerLabel.includes('line')) Icon = FaLine;
            else if (lowerId.includes('messenger') || lowerLabel.includes('messenger')) Icon = FaFacebookMessenger;
            else if (lowerId.includes('viber') || lowerLabel.includes('viber')) Icon = FaViber;

            return (
              <Link
                key={btn.id}
                href={btn.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mainButton}
                style={{
                  borderColor: btn.color || "#dbb958",
                  color: btn.color || "#dbb958",
                }}
              >
                <div className={styles.buttonContent}>
                  {Icon && <Icon size={24} />}
                  <span>{btn.label}</span>
                </div>
                <FaShareAlt className={styles.shareIcon} size={18} />
              </Link>
            );
          })}
        </div>

        {/* Social Media Links */}
        <div className={styles.socials}>
          {data.socials.map((social) => (
            social.active && (
              <Link
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialButton}
                style={{
                  backgroundColor: getSocialColor(social.id),
                  background: social.id === 'tiktok' ? 'linear-gradient(45deg, #000000, #25F4EE, #FE2C55)' : undefined
                }}
              >
                {social.id === 'facebook' && <FaFacebook size={28} />}
                {social.id === 'youtube' && <FaYoutube size={28} />}
                {social.id === 'tiktok' && <FaTiktok size={28} />}
                {social.id === 'telegram' && <FaTelegram size={28} />}
              </Link>
            )
          ))}
        </div>
      </div>
    </main>
  );
}
