import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ChainId, ThirdwebProvider, walletConnect } from "@thirdweb-dev/react";

import "./index.css";
import App from "./App";
import { StateContextProvider } from "./context/StateContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ChatProvider } from "./contexts/ChatContext";
import {
  Home,
  CampaignDetails,
  CreateCampaign,
  Campaigns,
  Profile,
  Protected,
  DashboardPage,
  NFTForm,
  NFTlist,
  NFTDetails,
  YourNFT,
  SearchResults,
} from "./pages";
import ChatPage from "./pages/ChatPage";

// Helper to get the current wallet address
const getCurrentWallet = () => window.ethereum?.selectedAddress || "";

const AppRouter = () => {
  const [wallet, setWallet] = useState(getCurrentWallet());

  useEffect(() => {
    if (!window.ethereum) return;
    const handler = (accounts) => {
      setWallet(accounts[0] || "");
    };
    window.ethereum.on("accountsChanged", handler);
    return () => window.ethereum.removeListener("accountsChanged", handler);
  }, []);

  // Also poll for wallet changes (in case of non-standard wallet providers)
  useEffect(() => {
    const interval = setInterval(() => {
      const latest = getCurrentWallet();
      setWallet((prev) => (prev !== latest ? latest : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
        <ThirdwebProvider
          clientId="bbdcef18b8fed391193ad80b535a261a"
          desiredChainId={ChainId.Sepolia}
          supportedWallets={[
            walletConnect({
              projectId: "747a4015cb677f03b9a8728b02701e36"
            })
          ]}
        >
        <StateContextProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </StateContextProvider>
      </ThirdwebProvider>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "dashboard", element: <Protected><DashboardPage /></Protected> },
      { path: "campaigns", element: <Protected><Campaigns /></Protected> },
      { path: "profile", element: <Protected><Profile /></Protected> },
      { path: "create-campaign", element: <Protected><CreateCampaign /></Protected> },
      { path: "nft-form", element: <Protected><NFTForm /></Protected> },
      { path: "nft-list", element: <Protected><NFTlist /></Protected> },
      { path: "nft/:id", element: <Protected><NFTDetails /></Protected> },
      { path: "campaign-details/:id", element: <Protected><CampaignDetails /></Protected> },
      { path: "your-nfts", element: <Protected><YourNFT /></Protected> },
      { path: "search/campaigns", element: <Protected><SearchResults /></Protected> },
      { path: "search/nfts", element: <Protected><SearchResults /></Protected> },
        {
          path: "chat",
          element: (
            <ChatProvider currentWallet={wallet}>
              <ChatPage />
            </ChatProvider>
          ),
        },
    ],
  },
]);

  return <RouterProvider router={router} />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  </React.StrictMode>
);
