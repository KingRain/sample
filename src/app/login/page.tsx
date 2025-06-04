"use client"

import { useState } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { FaGoogle } from "react-icons/fa";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/chat`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #000 0%, #333 100%)",
        width: "100vw",
        minHeight: "100vh",
      }}
    >
      <Container
        fluid
        className="p-0 m-0 d-flex justify-content-center align-items-center"
        style={{ width: "100vw", height: "100vh" }}
      >
        <Card
          className="border-0 shadow-lg"
          style={{
            background: "#1a1a1a",
            color: "#fff",
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Card.Body className="p-5 text-center">
            <h1
              className="display-4 fw-bold mb-4"
              style={{
                background: "linear-gradient(90deg, #00ff88 0%, #fff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              SampleChat
            </h1>
            <p className="mb-4" style={{ color: "#bbb" }}>
              Sign in with Google to continue
            </p>
            <Button
              variant="light"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              style={{
                background: "#222",
                color: "#fff",
                border: "1px solid #444",
                fontWeight: 500,
              }}
            >
              {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                  style={{ color: "#fff" }}
                ></span>
              ) : (
                <FaGoogle style={{ fontSize: 20, marginRight: 8 }} />
              )}
              <span>Sign in with Google</span>
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
