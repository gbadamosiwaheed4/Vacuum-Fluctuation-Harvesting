import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let listingCount = 0;
const energyListings = new Map();
const tokenBalances = new Map();

// Simulated contract functions
function createListing(amount: number, price: number, expiration: number, seller: string) {
  const listingId = ++listingCount;
  const sellerBalance = tokenBalances.get(seller) || 0;
  if (sellerBalance < amount) throw new Error('Insufficient balance');
  tokenBalances.set(seller, sellerBalance - amount);
  energyListings.set(listingId, {
    seller,
    amount,
    price,
    expiration: Date.now() + expiration * 1000 // Convert to milliseconds
  });
  return listingId;
}

function purchaseEnergy(listingId: number, buyer: string) {
  const listing = energyListings.get(listingId);
  if (!listing) throw new Error('Invalid listing');
  if (Date.now() > listing.expiration) throw new Error('Listing expired');
  const buyerBalance = tokenBalances.get(buyer) || 0;
  if (buyerBalance < listing.price) throw new Error('Insufficient balance');
  
  // Transfer tokens
  tokenBalances.set(buyer, buyerBalance - listing.price);
  const sellerBalance = tokenBalances.get(listing.seller) || 0;
  tokenBalances.set(listing.seller, sellerBalance + listing.price);
  
  // Transfer energy
  const buyerEnergyBalance = tokenBalances.get(`energy_${buyer}`) || 0;
  tokenBalances.set(`energy_${buyer}`, buyerEnergyBalance + listing.amount);
  
  // Remove listing
  energyListings.delete(listingId);
  return true;
}

function cancelListing(listingId: number, canceler: string) {
  const listing = energyListings.get(listingId);
  if (!listing) throw new Error('Invalid listing');
  if (listing.seller !== canceler) throw new Error('Not authorized');
  const sellerBalance = tokenBalances.get(listing.seller) || 0;
  tokenBalances.set(listing.seller, sellerBalance + listing.amount);
  energyListings.delete(listingId);
  return true;
}

// Helper function to set token balance
function setTokenBalance(account: string, balance: number) {
  tokenBalances.set(account, balance);
}

describe('Quantum Energy Marketplace Contract', () => {
  beforeEach(() => {
    listingCount = 0;
    energyListings.clear();
    tokenBalances.clear();
  });
  
  it('should create a new energy listing', () => {
    setTokenBalance('seller1', 1000);
    const id = createListing(500, 1000, 3600, 'seller1');
    expect(id).toBe(1);
    const listing = energyListings.get(id);
    expect(listing.amount).toBe(500);
    expect(listing.price).toBe(1000);
    expect(tokenBalances.get('seller1')).toBe(500);
  });
  
  it('should allow purchasing of energy', () => {
    setTokenBalance('seller2', 2000);
    setTokenBalance('buyer1', 5000);
    const listingId = createListing(1000, 2000, 7200, 'seller2');
    expect(purchaseEnergy(listingId, 'buyer1')).toBe(true);
    expect(tokenBalances.get('buyer1')).toBe(3000);
    expect(tokenBalances.get('seller2')).toBe(3000);
    expect(tokenBalances.get('energy_buyer1')).toBe(1000);
    expect(energyListings.has(listingId)).toBe(false);
  });
  
  it('should not allow purchase with insufficient balance', () => {
    setTokenBalance('seller3', 3000);
    setTokenBalance('buyer2', 500);
    const listingId = createListing(1500, 3000, 5400, 'seller3');
    expect(() => purchaseEnergy(listingId, 'buyer2')).toThrow('Insufficient balance');
  });
  
  it('should allow cancellation of listing by seller', () => {
    setTokenBalance('seller4', 5000);
    const listingId = createListing(2000, 4000, 10800, 'seller4');
    expect(cancelListing(listingId, 'seller4')).toBe(true);
    expect(energyListings.has(listingId)).toBe(false);
    expect(tokenBalances.get('seller4')).toBe(5000);
  });
  
  it('should not allow cancellation by non-seller', () => {
    setTokenBalance('seller5', 1000);
    const listingId = createListing(500, 1000, 3600, 'seller5');
    expect(() => cancelListing(listingId, 'unauthorized_user')).toThrow('Not authorized');
  });
  
  it('should not allow purchase of expired listing', async () => {
    setTokenBalance('seller6', 2000);
    setTokenBalance('buyer3', 3000);
    const listingId = createListing(1000, 2000, 1, 'seller6');
    
    // Wait for the listing to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    expect(() => purchaseEnergy(listingId, 'buyer3')).toThrow('Listing expired');
  });
});

