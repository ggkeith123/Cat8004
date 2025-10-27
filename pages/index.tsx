import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import { CAT8004_ADDRESS, CAT8004_ABI, ETH_PRICE_PER_1000_TOKENS, MIN_MINT_AMOUNT, MAX_MINT_AMOUNT } from '@/lib/contract';
import Image from 'next/image';

export default function Home() {
  const { isConnected } = useAccount();
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintAmount, setMintAmount] = useState(100);

  const { data: mintProgress, refetch: refetchProgress } = useReadContract({
    address: CAT8004_ADDRESS as `0x${string}`,
    abi: CAT8004_ABI,
    functionName: 'getMintProgress',
  });

  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

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
      address: CAT8004_ADDRESS as `0x${string}`,
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

  const calculateCost = () => {
    return (mintAmount / 1000) * parseFloat(ETH_PRICE_PER_1000_TOKENS);
  };

  const calculateUsdCost = () => {
    return (mintAmount / 1000) * 10;
  };

  const minted = mintProgress ? Number(mintProgress[0]) / 1e18 : 0;
  const total = mintProgress ? Number(mintProgress[1]) / 1e18 : 500000;
  const available = mintProgress ? Number(mintProgress[2]) / 1e18 : 500000;
  const progressPercentage = (minted / total) * 100;

  // Price breakdown data
  const priceBreakdown = [
    { tokens: 1, eth: '0.0000025', usd: '$0.01' },
    { tokens: 100, eth: '0.00025', usd: '$1.00' },
    { tokens: 500, eth: '0.00125', usd: '$5.00' },
    { tokens: 1000, eth: '0.0025', usd: '$10.00' },
    { tokens: 2500, eth: '0.00625', usd: '$25.00' },
    { tokens: 5000, eth: '0.0125', usd: '$50.00' },
  ];

  return (
    <div className="min-h-screen p-4 py-8">
      {/* Header with Logo and X Icon */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="text-6xl font-black text-gradient">
              CAT<span className="text-cat-accent">8004</span>
            </div>
          </div>
          <a
            href="https://x.com/cat_8004"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full transition-all hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="font-semibold">Follow @cat_8004</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Left Column - Cat Mascot & Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Cat Mascot Card */}
          <div className="glass-effect rounded-3xl p-6 shadow-blue">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 animate-float">
              <img
                src="/cat-mascot.jpg"
                alt="Cat8004 Mascot"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold text-cat-blue-dark text-center mb-2">
              Meet Cat8004! 🐱
            </h2>
            <p className="text-center text-gray-600 text-sm">
              Your purr-fect companion to the moon! 🚀
            </p>
          </div>

          {/* Token Info Card */}
          <div className="glass-effect rounded-3xl p-6 shadow-blue">
            <h3 className="text-xl font-bold text-cat-blue-dark mb-4 flex items-center gap-2">
              <span>📊</span> Token Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Supply:</span>
                <span className="font-bold text-cat-blue-dark">1,000,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mintable:</span>
                <span className="font-bold text-cat-blue-dark">500,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Network:</span>
                <span className="font-bold text-cat-blue-dark">Base</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-bold text-cat-blue-dark">1k = $10</span>
              </div>
            </div>
          </div>

          {/* Chart Card */}
          <div className="glass-effect rounded-3xl p-6 shadow-blue">
            <h3 className="text-xl font-bold text-cat-blue-dark mb-4 flex items-center gap-2">
              <span>📈</span> Minting Progress
            </h3>
            <div className="space-y-4">
              {/* Bar Chart */}
              <div className="relative h-48 flex items-end gap-2">
                {/* Minted Bar */}
                <div className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-cat-blue-dark to-cat-blue rounded-t-lg relative transition-all duration-1000"
                    style={{ height: `${(minted / total) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-0 right-0 text-center">
                      <span className="text-xs font-bold text-cat-blue-dark bg-white px-2 py-1 rounded-full">
                        {minted.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-600 mt-2">Minted</span>
                </div>
                {/* Available Bar */}
                <div className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-lg relative transition-all duration-1000"
                    style={{ height: `${(available / total) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-0 right-0 text-center">
                      <span className="text-xs font-bold text-gray-700 bg-white px-2 py-1 rounded-full">
                        {available.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-600 mt-2">Available</span>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                <div className="text-center p-2 bg-cat-blue-light/20 rounded-lg">
                  <div className="text-2xl font-bold text-cat-blue-dark">{progressPercentage.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Minted</div>
                </div>
                <div className="text-center p-2 bg-gray-100 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700">{(100 - progressPercentage).toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Remaining</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Minting Interface */}
        <div className="lg:col-span-1 space-y-6">
          {/* Wallet Connect */}
          <div className="glass-effect rounded-3xl p-6 shadow-blue flex justify-center">
            <ConnectButton />
          </div>

          {isConnected && (
            <>
              {/* Amount Selector */}
              <div className="glass-effect rounded-3xl p-6 shadow-blue">
                <h3 className="text-xl font-bold text-cat-blue-dark mb-4 flex items-center gap-2">
                  <span>🎯</span> Select Amount
                </h3>
                <label className="block text-sm font-semibold text-gray-600 mb-3">
                  How many tokens? (1 - 5,000)
                </label>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => handleAmountChange(mintAmount - 10)}
                    disabled={mintAmount <= MIN_MINT_AMOUNT}
                    className="bg-cat-blue hover:bg-cat-blue-dark text-white px-6 py-3 rounded-xl font-bold disabled:bg-gray-300 transition-all hover:scale-105 text-xl"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={mintAmount}
                    onChange={(e) => handleAmountChange(parseInt(e.target.value) || MIN_MINT_AMOUNT)}
                    min={MIN_MINT_AMOUNT}
                    max={MAX_MINT_AMOUNT}
                    className="flex-1 text-center text-4xl font-bold text-cat-blue bg-white rounded-xl px-4 py-4 border-2 border-cat-blue focus:ring-4 focus:ring-cat-blue-light focus:outline-none"
                  />
                  <button
                    onClick={() => handleAmountChange(mintAmount + 10)}
                    disabled={mintAmount >= Math.min(MAX_MINT_AMOUNT, available)}
                    className="bg-cat-blue hover:bg-cat-blue-dark text-white px-6 py-3 rounded-xl font-bold disabled:bg-gray-300 transition-all hover:scale-105 text-xl"
                  >
                    +
                  </button>
                </div>
                
                {/* Quick Select */}
                <div className="grid grid-cols-5 gap-2">
                  {[1, 10, 100, 1000, 5000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setMintAmount(Math.min(amount, available))}
                      disabled={amount > available}
                      className={`py-2 px-2 rounded-lg font-semibold text-sm transition-all ${
                        mintAmount === amount
                          ? 'bg-cat-blue text-white scale-105'
                          : 'bg-white text-cat-blue hover:bg-cat-blue-light hover:text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                    >
                      {amount >= 1000 ? `${amount/1000}k` : amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Display */}
              <div className="glass-effect rounded-3xl p-6 shadow-blue">
                <h3 className="text-xl font-bold text-cat-blue-dark mb-4 flex items-center gap-2">
                  <span>💰</span> Your Cost
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-cat-blue to-cat-blue-dark p-4 rounded-xl text-white text-center">
                    <div className="text-3xl font-bold mb-1">{calculateCost().toFixed(6)}</div>
                    <div className="text-sm opacity-90">ETH</div>
                  </div>
                  <div className="bg-gradient-to-br from-cat-accent to-yellow-500 p-4 rounded-xl text-white text-center">
                    <div className="text-3xl font-bold mb-1">${calculateUsdCost().toFixed(2)}</div>
                    <div className="text-sm opacity-90">USD</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-cat-blue-light/20 rounded-lg text-center">
                  <p className="text-sm font-semibold text-cat-blue-dark">
                    Rate: 1,000 tokens = $10 (0.0025 ETH)
                  </p>
                </div>
              </div>

              {/* Mint Button */}
              <button
                onClick={handleMint}
                disabled={isPending || isConfirming || available === 0 || mintAmount > available || mintAmount < MIN_MINT_AMOUNT}
                className={`w-full py-5 px-8 rounded-2xl text-xl font-bold text-white transition-all duration-300 shadow-blue ${
                  isPending || isConfirming || available === 0 || mintAmount > available || mintAmount < MIN_MINT_AMOUNT
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cat-blue to-cat-blue-dark hover:scale-105'
                }`}
              >
                {isPending || isConfirming ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isPending ? 'Confirm in Wallet...' : 'Minting...'}
                  </span>
                ) : available === 0 ? (
                  '😿 Sold Out!'
                ) : mintAmount > available ? (
                  '⚠️ Not Enough Available'
                ) : (
                  `🐾 Mint ${mintAmount.toLocaleString()} Cat8004`
                )}
              </button>

              {/* Success Message */}
              {mintSuccess && (
                <div className="glass-effect rounded-2xl p-6 border-2 border-green-500 shadow-blue animate-pulse-slow">
                  <div className="text-center">
                    <div className="text-6xl mb-3">🎉</div>
                    <div className="text-green-700 font-bold text-xl mb-1">
                      Success!
                    </div>
                    <div className="text-green-600">
                      {mintAmount.toLocaleString()} Cat8004 tokens minted! 😸
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Progress Bar */}
          <div className="glass-effect rounded-3xl p-6 shadow-blue">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span className="font-semibold">Progress</span>
              <span className="font-bold text-cat-blue-dark">{minted.toLocaleString()} / {total.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cat-blue via-cat-blue-light to-cat-accent h-full rounded-full transition-all duration-1000 animate-pulse-slow"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-center mt-2">
              <span className="text-2xl font-bold text-cat-blue-dark">{available.toLocaleString()}</span>
              <span className="text-sm text-gray-600 ml-2">tokens available</span>
            </div>
          </div>
        </div>

        {/* Right Column - Price Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-effect rounded-3xl p-6 shadow-blue">
            <h3 className="text-xl font-bold text-cat-blue-dark mb-4 flex items-center gap-2">
              <span>💵</span> Price Breakdown
            </h3>
            <div className="space-y-2">
              {priceBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl transition-all hover:scale-105 cursor-pointer ${
                    mintAmount === item.tokens
                      ? 'bg-gradient-to-r from-cat-blue to-cat-blue-dark text-white shadow-lg'
                      : 'bg-white hover:bg-cat-blue-light/20'
                  }`}
                  onClick={() => setMintAmount(item.tokens)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className={`text-lg font-bold ${mintAmount === item.tokens ? 'text-white' : 'text-cat-blue-dark'}`}>
                        {item.tokens.toLocaleString()} tokens
                      </div>
                      <div className={`text-sm ${mintAmount === item.tokens ? 'text-white/80' : 'text-gray-600'}`}>
                        {item.eth} ETH
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${mintAmount === item.tokens ? 'text-cat-accent' : 'text-cat-blue'}`}>
                      {item.usd}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contract Info */}
          <div className="glass-effect rounded-3xl p-6 shadow-blue">
            <h3 className="text-xl font-bold text-cat-blue-dark mb-4 flex items-center gap-2">
              <span>🔗</span> Contract
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Network:</div>
                <div className="font-bold text-cat-blue-dark">Base Mainnet</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Address:</div>
                <a
                  href={`https://basescan.org/address/${CAT8004_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cat-blue hover:text-cat-blue-dark break-all font-mono text-xs hover:underline"
                >
                  {CAT8004_ADDRESS}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center">
        <p className="text-gray-600 text-sm">
          Made with 💙 for cat lovers | Powered by Base ⚡
        </p>
      </div>
    </div>
  );
}
