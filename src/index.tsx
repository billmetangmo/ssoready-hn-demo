import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Outlet, Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { Toaster, toast } from "sonner";

function Skeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Outlet />
      </div>
    </div>
  );
}

function LoginPage() {
  const [email, setEmail] = useState("");

  const getRedirect = useMutation({
    mutationFn: async (domain: string) => {
      try {
        const res = await axios.post<{ redirectUrl: string }>(
          "/api/saml/redirect",
          {
            domain,
          },
        );

        window.location.assign(res.data.redirectUrl);
      } catch (e) {
        toast.error("Error fetching /api/saml/redirect");
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    getRedirect.mutate(email.split("@")[1]);
  };

  return (
    <div className="flex h-screen flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in with SAML
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SSOReadyCallbackPage() {
  const redeem = useMutation({
    mutationFn: async (code: string) => {
      try {
        await axios.post("/api/saml/redeem", {
          samlAccessCode,
        });

        toast.success("Successfully logged in via SAML.");
        window.location.href = "/";
      } catch (e) {
        toast.error("Error fetching /api/saml/redeem");
      }
    },
  });

  const samlAccessCode = new URLSearchParams(window.location.search).get(
    "saml_access_code",
  );

  useEffect(() => {
    redeem.mutate(samlAccessCode);
  }, [samlAccessCode]);

  return <div>loading...</div>;
}

function IndexPage() {
  const { data } = useQuery({
    queryKey: ["whoami"],
    queryFn: async () => {
      return await axios.get<{ email: string }>("/api/whoami");
    },
  });

  return (
    <main className="grid h-screen w-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-indigo-600">
          This is an index page!
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {data?.data.email ? (
            <>Hello, {data.data.email}</>
          ) : (
            <>Hello, logged-out user!</>
          )}
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          Isn't it a great day to write some B2B SaaS?
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/login"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Log In
          </a>
        </div>
      </div>
    </main>
  );
}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="" element={<Skeleton />}>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/ssoready-callback"
              element={<SSOReadyCallbackPage />}
            />
            <Route path="/" element={<IndexPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

const root = createRoot(document.getElementById("react-root")!);
root.render(<App />);
