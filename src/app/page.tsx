
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
  const filePath = path.join(process.cwd(), "src/data.json");
  if (!fs.existsSync(filePath)) {
    return {
      logo: "/uploads/logo.png",
      mainButtons: [],
      socials: []
    };
  }
  const fileContent = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContent);
}

export default async function Home() {
  const data = await getData();

  // Helper for social colors
  const getSocialColor = (id: string) => {
    switch(id) {
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
