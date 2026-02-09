
'use client';

import { useState, useEffect } from 'react';
import styles from './admin.module.css';

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch data", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        alert('Changes saved successfully!');
      } else {
        alert('Failed to save changes.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        const newData = { ...data, logo: result.url };
        setData(newData);
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Upload error');
    }
  };

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (!data) return <div className={styles.container}>Error loading data.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Admin Control Panel</h1>
        <button 
          className={`${styles.btn} ${styles.btnSuccess}`} 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </header>

      {/* Logo Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Logo Image</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>Current Logo:</label>
          <div style={{ background: '#333', padding: '10px', display: 'inline-block', borderRadius: '8px' }}>
            {data.logo ? (
              <img src={data.logo} alt="Current Logo" className={styles.previewImage} style={{ maxWidth: '100%', maxHeight: '150px' }} />
            ) : (
              <p>No logo set</p>
            )}
          </div>
          <input type="file" onChange={handleImageUpload} className={styles.fileInput} accept="image/*" />
        </div>
      </div>

      {/* Affiliate/Promo Button Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>High RTP / Promo Button</h2>
        {data.affiliateButton ? (
          <div className={styles.buttonList}>
            <div className={styles.buttonItem} style={{ gridTemplateColumns: "1fr 1fr auto" }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label className={styles.label}>Label</label>
                <input 
                  type="text" 
                  value={data.affiliateButton.label} 
                  onChange={(e) => {
                    const newData = {...data};
                    newData.affiliateButton.label = e.target.value;
                    setData(newData);
                  }}
                  className={styles.input}
                  placeholder="Label"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label className={styles.label}>Link URL</label>
                <input 
                  type="text" 
                  value={data.affiliateButton.url} 
                  onChange={(e) => {
                    const newData = {...data};
                    newData.affiliateButton.url = e.target.value;
                    setData(newData);
                  }}
                  className={styles.input}
                  placeholder="URL"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={data.affiliateButton.enabled} 
                    onChange={(e) => {
                      const newData = {...data};
                      newData.affiliateButton.enabled = e.target.checked;
                      setData(newData);
                    }}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span style={{ fontSize: '1.1rem' }}>Enabled</span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <button 
            className={`${styles.btn} ${styles.btnPrimary}`} 
            onClick={() => {
              const newData = {...data};
              newData.affiliateButton = { label: "Promo Button", url: "#", enabled: true };
              setData(newData);
            }}
          >
            Enable Promo Button
          </button>
        )}
      </div>

      {/* Main Buttons Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Main Action Buttons</h2>
        <div className={styles.buttonList}>
          {data.mainButtons.map((btn: any, index: number) => (
            <div key={index} className={styles.buttonItem}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label className={styles.label}>Label</label>
                <input 
                  type="text" 
                  value={btn.label} 
                  onChange={(e) => {
                    const newData = {...data};
                    newData.mainButtons[index].label = e.target.value;
                    setData(newData);
                  }}
                  className={styles.input}
                  placeholder="Label"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label className={styles.label}>Link URL</label>
                <input 
                  type="text" 
                  value={btn.url} 
                  onChange={(e) => {
                    const newData = {...data};
                    newData.mainButtons[index].url = e.target.value;
                    setData(newData);
                  }}
                  className={styles.input}
                  placeholder="URL"
                />
              </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label className={styles.label}>Color</label>
                <input 
                  type="color" 
                  value={btn.color} 
                  onChange={(e) => {
                    const newData = {...data};
                    newData.mainButtons[index].color = e.target.value;
                    setData(newData);
                  }}
                  className={styles.input}
                  style={{ width: '50px', height: '40px', padding: 0, cursor: 'pointer' }}
                />
              </div>
              <button 
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={() => {
                  const newData = {...data};
                  newData.mainButtons.splice(index, 1);
                  setData(newData);
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <button 
          className={`${styles.btn} ${styles.btnPrimary}`} 
          style={{ marginTop: '1rem' }}
          onClick={() => {
            const newData = {...data};
            if (!newData.mainButtons) newData.mainButtons = [];
            newData.mainButtons.push({ id: Date.now().toString(), label: "New Button", url: "#", color: "#ffcc00" });
            setData(newData);
          }}
        >
          Add New Button
        </button>
      </div>

      {/* Social Links Section */}
       <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Social Media Links</h2>
        <div className={styles.buttonList}>
          {data.socials.map((social: any, index: number) => (
            <div key={index} className={styles.buttonItem} style={{ gridTemplateColumns: "1fr 2fr 1fr" }}>
               <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: "bold", textTransform: "capitalize", fontSize: '1.1rem' }}>{social.id}</span>
              </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label className={styles.label}>Link URL</label>
                <input 
                  type="text" 
                  value={social.url} 
                  onChange={(e) => {
                    const newData = {...data};
                    newData.socials[index].url = e.target.value;
                    setData(newData);
                  }}
                  className={styles.input}
                  placeholder="URL"
                />
              </div>
               <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={social.active} 
                    onChange={(e) => {
                      const newData = {...data};
                      newData.socials[index].active = e.target.checked;
                      setData(newData);
                    }}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span style={{ fontSize: '1.1rem' }}>Active</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
