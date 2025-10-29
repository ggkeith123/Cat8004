import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther, formatEther } from 'viem';
import { 
  CAT8004_ADDRESS, 
  CAT8004_ABI, 
  ETH_PRICE_PER_1000_TOKENS, 
  MIN_MINT_AMOUNT, 
  MAX_MINT_AMOUNT,
  TOKENS_PER_NFT 
} from '../lib/contract';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintAmount, setMintAmount] = useState(1000);

  // Read contract data
  const { data: mintProgress, refetch: refetchProgress } = useReadContract({
    address: CAT8004_ADDRESS,
    abi: CAT8004_ABI,
    functionName: 'getMintProgress',
  });

  const { data: userBalance } = useReadContract({
    address: CAT8004_ADDRESS,
    abi: CAT8004_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: expectedNFTs } = useReadContract({
    address: CAT8004_ADDRESS,
    abi: CAT8004_ABI,
    functionName: 'getExpectedNFTCount',
    args: address ? [address] : undefined,
  });

  const { data: distributionCount } = useReadContract({
    address: CAT8004_ADDRESS,
    abi: CAT8004_ABI,
    functionName: 'getDistributionCount',
  });

  // Write contract
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      setMintSuccess(true);
      refetchProgress();
      setTimeout(() => setMintSuccess(false), 5000);
    }
  }, [isSuccess, refetchProgress]);

  const handleMint = () => {
    const costInEth = (mintAmount / 1000) * parseFloat(ETH_PRICE_PER_1000_TOKENS);
    writeContract({
      address: CAT8004_ADDRESS,
      abi: CAT8004_ABI,
      functionName: 'mint',
      args: [BigInt(mintAmount)],
      value: parseEther(costInEth.toString()),
    });
  };

  const handleAmountChange = (value: number) => {
    const clamped = Math.max(MIN_MINT_AMOUNT, Math.min(MAX_MINT_AMOUNT, Math.floor(value)));
    setMintAmount(clamped);
  };

  const calculateCost = () => (mintAmount / 1000) * parseFloat(ETH_PRICE_PER_1000_TOKENS);
  const calculateUsdCost = () => (mintAmount / 1000) * 10;
  const calculateNFTs = () => Math.floor(mintAmount / TOKENS_PER_NFT);

  // Safe conversions
  const minted = mintProgress ? Number(mintProgress[0]) / 1e18 : 0;
  const total = mintProgress ? Number(mintProgress[1]) / 1e18 : 500000;
  const available = mintProgress ? Number(mintProgress[2]) / 1e18 : 500000;
  const progressPercentage = total > 0 ? (minted / total) * 100 : 0;

  const userNFTCount = expectedNFTs ? Number(expectedNFTs) : 0;
  const userTokenBalance = userBalance ? Number(userBalance) / 1e18 : 0;
  const distCount = distributionCount ? Number(distributionCount) : 0;

  const priceBreakdown = [
    { tokens: 1000, eth: '0.0025', usd: '$10', nfts: 1 },
    { tokens: 2500, eth: '0.00625', usd: '$25', nfts: 2 },
    { tokens: 5000, eth: '0.0125', usd: '$50', nfts: 5 },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl font-display font-bold">
                <span className="gradient-text">CAT</span>
                <span className="gradient-text-gold">8004</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 glass-card px-4 py-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-white/70 font-mono">ERC404</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://x.com/cat_8004"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary hidden sm:flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="font-semibold">@cat_8004</span>
              </a>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 glass-card px-6 py-3 mb-6">
            <span className="text-2xl">🐱</span>
            <span className="text-white/80 font-medium">Hybrid ERC20 + ERC721 Token</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4">
            <span className="gradient-text">The Future of </span>
            <br />
            <span className="gradient-text-gold">Cat Tokens</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Every 1,000 tokens automatically mints an NFT. Trade tokens, collect NFTs, join the revolution.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Left Sidebar - Stats & Cat */}
          <div className="lg:col-span-4 space-y-6">
            {/* Cat Mascot */}
            <div className="glass-card p-6 animate-slide-up">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 animate-float">
                <img
                  src="/cat-mascot.jpg"
                  alt="Cat8004"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-display font-bold text-white mb-2">
                  Meet Cat8004
                </h3>
                <p className="text-white/60 text-sm">
                  Your gateway to the future of hybrid tokens
                </p>
              </div>
            </div>

            {/* User Stats */}
            {isConnected && (
              <div className="glass-card p-6 space-y-4">
                <h3 className="section-title text-xl">
                  <span>👤</span> Your Holdings
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <span className="text-white/70">Tokens</span>
                    <span className="text-2xl font-bold gradient-text">
                      {userTokenBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <span className="text-white/70">NFTs</span>
                    <span className="text-2xl font-bold gradient-text-gold">
                      {userNFTCount}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Token Info */}
            <div className="glass-card p-6">
              <h3 className="section-title text-xl">
                <span>📊</span> Token Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Type</span>
                  <span className="font-mono font-semibold text-cat-blue-400">ERC404</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Total Supply</span>
                  <span className="font-semibold text-white">1,000,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Mintable</span>
                  <span className="font-semibold text-white">500,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">NFT Ratio</span>
                  <span className="font-semibold text-cat-accent-500">1k = 1 NFT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Network</span>
                  <span className="font-semibold text-white">Base</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Distributions</span>
                  <span className="font-semibold text-white">{distCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Main Minting */}
          <div className="lg:col-span-5 space-y-6">
            {/* Amount Selector */}
            <div className="glass-card-solid p-8">
              <h3 className="section-title">
                <span>🎯</span> Select Amount
              </h3>
              
              <div className="space-y-6">
                {/* Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Number of Tokens (1 - 5,000)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAmountChange(mintAmount - 100)}
                      disabled={mintAmount <= MIN_MINT_AMOUNT}
                      className="btn-primary px-6 py-4 text-lg disabled:opacity-30"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={mintAmount}
                      onChange={(e) => handleAmountChange(parseInt(e.target.value) || MIN_MINT_AMOUNT)}
                      className="flex-1 text-center value-display text-cat-blue-600 bg-cat-blue-50 rounded-2xl px-4 py-4 border-2 border-cat-blue-200 focus:border-cat-blue-500 focus:ring-4 focus:ring-cat-blue-500/20 focus:outline-none transition-all"
                    />
                    <button
                      onClick={() => handleAmountChange(mintAmount + 100)}
                      disabled={mintAmount >= Math.min(MAX_MINT_AMOUNT, available)}
                      className="btn-primary px-6 py-4 text-lg disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Quick Select */}
                <div className="grid grid-cols-3 gap-3">
                  {[1000, 2500, 5000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setMintAmount(Math.min(amount, available))}
                      disabled={amount > available}
                      className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                        mintAmount === amount
                          ? 'bg-cat-blue-600 text-white shadow-glow'
                          : 'bg-cat-blue-100 text-cat-blue-700 hover:bg-cat-blue-200'
                      } disabled:opacity-30`}
                    >
                      {amount.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* NFT Preview */}
                <div className="p-4 bg-gradient-to-r from-cat-accent-50 to-cat-accent-100 rounded-xl border-2 border-cat-accent-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">🎨</div>
                      <div>
                        <div className="text-sm font-semibold text-gray-700">You will receive</div>
                        <div className="text-2xl font-display font-bold text-cat-accent-600">
                          {calculateNFTs()} NFT{calculateNFTs() !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">+ Tokens</div>
                      <div className="text-xl font-bold text-gray-900">{mintAmount.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Display */}
            <div className="glass-card-solid p-8">
              <h3 className="section-title">
                <span>💰</span> Cost
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-gradient-to-br from-cat-blue-500 to-cat-blue-700 rounded-2xl text-white text-center shadow-glow">
                  <div className="text-sm opacity-80 mb-1">ETH</div>
                  <div className="value-display">{calculateCost().toFixed(4)}</div>
                </div>
                <div className="p-6 bg-gradient-to-br from-cat-accent-400 to-cat-accent-600 rounded-2xl text-white text-center shadow-lg">
                  <div className="text-sm opacity-80 mb-1">USD</div>
                  <div className="value-display">${calculateUsdCost().toFixed(2)}</div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-cat-blue-50 rounded-xl text-center">
                <p className="text-sm font-semibold text-cat-blue-900">
                  Rate: 1,000 tokens = 0.0025 ETH ($10)
                </p>
              </div>
            </div>

            {/* Mint Button */}
            {isConnected ? (
              <button
                onClick={handleMint}
                disabled={isPending || isConfirming || available === 0 || mintAmount > available}
                className="w-full btn-primary py-6 text-xl disabled:opacity-50"
              >
                {isPending || isConfirming ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isPending ? 'Confirm in Wallet' : 'Minting...'}
                  </span>
                ) : available === 0 ? (
                  'Sold Out 😿'
                ) : (
                  `Mint ${mintAmount.toLocaleString()} Cat8004 🐾`
                )}
              </button>
            ) : (
              <div className="text-center p-6 glass-card-solid">
                <p className="text-gray-600 mb-4">Connect your wallet to start minting</p>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </div>
            )}

            {/* Success */}
            {mintSuccess && (
              <div className="glass-card-solid p-6 border-2 border-green-500 animate-slide-up">
                <div className="text-center">
                  <div className="text-6xl mb-3">🎉</div>
                  <div className="text-2xl font-bold text-green-700 mb-2">Success!</div>
                  <div className="text-green-600">
                    {mintAmount.toLocaleString()} tokens + {calculateNFTs()} NFT{calculateNFTs() !== 1 ? 's' : ''} minted!
                  </div>
                </div>
              </div>
            )}

            {/* Progress */}
            <div className="glass-card p-6">
              <div className="flex justify-between text-sm text-white/70 mb-3">
                <span className="font-semibold">Minting Progress</span>
                <span className="font-mono">{minted.toLocaleString(undefined, { maximumFractionDigits: 0 })} / {total.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cat-blue-500 via-cat-blue-400 to-cat-accent-500 transition-all duration-1000 shimmer"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-center mt-4">
                <div className="text-3xl font-display font-bold gradient-text">{available.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="text-white/60 text-sm">tokens available</div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Pricing & Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Price Breakdown */}
            <div className="glass-card p-6">
              <h3 className="section-title text-xl">
                <span>💵</span> Pricing
              </h3>
              <div className="space-y-3">
                {priceBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setMintAmount(item.tokens)}
                    className={`price-card p-4 cursor-pointer ${
                      mintAmount === item.tokens ? 'price-card-active' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className={`text-lg font-bold ${mintAmount === item.tokens ? 'text-white' : 'text-white'}`}>
                          {item.tokens.toLocaleString()}
                        </div>
                        <div className={`text-xs ${mintAmount === item.tokens ? 'text-white/80' : 'text-white/60'}`}>
                          tokens
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-display font-bold ${mintAmount === item.tokens ? 'text-cat-accent-400' : 'gradient-text-gold'}`}>
                          {item.usd}
                        </div>
                        <div className={`text-xs font-mono ${mintAmount === item.tokens ? 'text-white/80' : 'text-white/60'}`}>
                          {item.eth} ETH
                        </div>
                      </div>
                    </div>
                    <div className={`text-xs ${mintAmount === item.tokens ? 'text-white/80' : 'text-white/60'}`}>
                      🎨 {item.nfts} NFT{item.nfts > 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contract Info */}
            <div className="glass-card p-6">
              <h3 className="section-title text-xl">
                <span>🔗</span> Contract
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-white/60 mb-1">Network</div>
                  <div className="font-semibold text-white">Base Mainnet</div>
                </div>
                <div>
                  <div className="text-white/60 mb-1">Address</div>
                  <a
                    href={`https://basescan.org/address/${CAT8004_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cat-blue-400 hover:text-cat-blue-300 break-all font-mono text-xs hover:underline"
                  >
                    {CAT8004_ADDRESS}
                  </a>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="glass-card p-6">
              <h3 className="section-title text-xl">
                <span>✨</span> Features
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-white/80">Auto NFT minting per 1k tokens</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-white/80">Manual distribution tracking</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-white/80">Verified on BaseScan</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-white/80">Hybrid ERC20/ERC721</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-white/50 text-sm">
            Made with 💙 for cat lovers | Powered by Base ⚡
          </p>
        </div>
      </footer>
    </div>
  );
}
