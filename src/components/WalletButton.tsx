import React from "react";
import { Wallet, Copy, LogOut, X, Check } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

export default function WalletButton() {
  const { address, isConnected } = useAccount();
  const { data: bal } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const balNum = bal ? Number(bal.formatted) : 0;

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, mounted }) => {
        const ready = mounted;
        if (!ready) return <div style={{ width: 160, height: 32 }} />;

        if (!isConnected || !address) {
          return (
            <button className="btn btn-primary btn-sm" onClick={openConnectModal}>
              <Wallet size={14} /> Connect Wallet
            </button>
          );
        }

        const short = `${address.slice(0, 6)}…${address.slice(-4)}`;

        return (
          <>
            <div className="bal"><span className="coin">◆</span> {balNum.toLocaleString(undefined, { maximumFractionDigits: 4 })} zkLTC</div>
            <button className="btn btn-ghost btn-sm wallet-chip" onClick={() => setOpen(true)}>
              <span className="wb-avatar"><Jazzicon diameter={18} seed={jsNumberForAddress(address)} /></span>
              {short}
            </button>

            {open && (
              <div className="wb-overlay" onClick={() => setOpen(false)}>
                <div className="wb-modal" onClick={(e) => e.stopPropagation()}>
                  <button className="wb-close" onClick={() => setOpen(false)}><X size={16} /></button>
                  <div className="wb-avatar-lg"><Jazzicon diameter={64} seed={jsNumberForAddress(address)} /></div>
                  <div className="wb-addr mono">{short}</div>
                  <div className="wb-bal">
                    <span className="coin">◆</span>
                    <b>{balNum.toLocaleString(undefined, { maximumFractionDigits: 6 })}</b>
                    <span className="wb-sym">zkLTC</span>
                  </div>
                  <div className="wb-actions">
                    <button
                      className="wb-btn"
                      onClick={async () => {
                        await navigator.clipboard.writeText(address);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy Address"}
                    </button>
                    <button
                      className="wb-btn danger"
                      onClick={() => { disconnect(); setOpen(false); }}
                    >
                      <LogOut size={14} /> Disconnect
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
}
