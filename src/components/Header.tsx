
export const Header = () => (
  <header className="flex flex-col gap-2">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
        DS
      </div>
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
        Double Spend Visualizer
      </h1>
    </div>
    <p className="text-gray-400 text-sm max-w-2xl">
      Simulate a 51% attack (or similar race condition) on a Proof-of-Work blockchain. 
      Adjust the hashrates to see if the attacker can secretly build a longer chain 
      and replace the honest history.
    </p>
  </header>
);