import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

type UserMetadata = {
  name?: string;
  avatar_url?: string;
};

type ExtendedUser = User & {
  user_metadata?: UserMetadata;
};

export default function Navbar() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user as ExtendedUser);
    };
    getSession();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button
          onClick={handleLogout}
          className="logout-btn"
          title="Logout"
        >
          <FaSignOutAlt className="logout-icon" />
        </button>
      </div>
      <div className="navbar-center">
        <h1 className="navbar-title">SampleChat</h1>
      </div>
      <div className="navbar-right">
        {user && user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata.name || "User"}
            className="user-avatar"
          />
        ) : (
          <FaUserCircle className="user-icon" />
        )}
        <span className="user-name">
          {user ? user.user_metadata?.name || "User" : "Not logged in"}
        </span>
      </div>
      <style jsx>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: #222;
          border-bottom: 1px solid #333;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .navbar-left,
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .navbar-center {
          flex: 1;
          text-align: center;
        }
        .navbar-title {
          color: #a3e635;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(90deg, #a3e635 0%, #fff 90%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .logout-btn {
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        .logout-btn:hover {
          background-color: #333;
        }
        .logout-icon {
          font-size: 1.2rem;
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }
        .user-icon {
          font-size: 1.5rem;
          color: #fff;
        }
        .user-name {
          color: #fff;
          font-size: 0.9rem;
        }
        @media (max-width: 768px) {
          .navbar {
            padding: 1rem;
          }
          .navbar-left,
          .navbar-right {
            gap: 0.5rem;
          }
          .navbar-title {
            font-size: 1.2rem;
          }
          .user-name {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
