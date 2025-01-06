import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let lastTokenId = 0;
const tokenMetadata = new Map();
const tokenOwners = new Map();

// Simulated contract functions
function mintHotspot(location: string, energyDensity: number, stability: number, discoverer: string) {
  const tokenId = ++lastTokenId;
  if (stability < 0 || stability > 100) {
    throw new Error('Invalid stability score');
  }
  tokenMetadata.set(tokenId, {
    discoverer,
    location,
    energyDensity,
    stability,
    discoveryTime: Date.now()
  });
  tokenOwners.set(tokenId, discoverer);
  return tokenId;
}

function transferHotspot(tokenId: number, sender: string, recipient: string) {
  if (tokenOwners.get(tokenId) !== sender) {
    throw new Error('Not authorized');
  }
  tokenOwners.set(tokenId, recipient);
  return true;
}

describe('Vacuum Energy Hotspot NFT Contract', () => {
  beforeEach(() => {
    lastTokenId = 0;
    tokenMetadata.clear();
    tokenOwners.clear();
  });
  
  it('should mint a new vacuum energy hotspot NFT', () => {
    const id = mintHotspot('Deep Space Sector X', 1000000, 95, 'scientist1');
    expect(id).toBe(1);
    const metadata = tokenMetadata.get(id);
    expect(metadata.location).toBe('Deep Space Sector X');
    expect(metadata.stability).toBe(95);
    expect(tokenOwners.get(id)).toBe('scientist1');
  });
  
  it('should transfer hotspot NFT ownership', () => {
    const id = mintHotspot('Galactic Core Region', 5000000, 80, 'scientist2');
    expect(transferHotspot(id, 'scientist2', 'researcher1')).toBe(true);
    expect(tokenOwners.get(id)).toBe('researcher1');
  });
  
  it('should not allow minting with invalid stability score', () => {
    expect(() => mintHotspot('Invalid Location', 100000, 101, 'scientist3')).toThrow('Invalid stability score');
  });
  
  it('should not allow unauthorized transfers', () => {
    const id = mintHotspot('Quantum Foam Bubble', 3000000, 70, 'scientist4');
    expect(() => transferHotspot(id, 'unauthorized_user', 'researcher2')).toThrow('Not authorized');
  });
});

