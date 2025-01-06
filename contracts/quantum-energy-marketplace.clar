;; Quantum Energy Marketplace Contract

(define-fungible-token quantum-energy-token)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_LISTING (err u101))
(define-constant ERR_INSUFFICIENT_BALANCE (err u102))

;; Data variables
(define-data-var listing-count uint u0)

;; Data maps
(define-map energy-listings
  uint
  {
    seller: principal,
    amount: uint,
    price: uint,
    expiration: uint
  }
)

;; Public functions
(define-public (create-listing (amount uint) (price uint) (expiration uint))
  (let
    (
      (listing-id (+ (var-get listing-count) u1))
    )
    (asserts! (>= (ft-get-balance quantum-energy-token tx-sender) amount) ERR_INSUFFICIENT_BALANCE)
    (try! (ft-transfer? quantum-energy-token amount tx-sender (as-contract tx-sender)))
    (map-set energy-listings
      listing-id
      {
        seller: tx-sender,
        amount: amount,
        price: price,
        expiration: (+ block-height expiration)
      }
    )
    (var-set listing-count listing-id)
    (ok listing-id)
  )
)

(define-public (purchase-energy (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? energy-listings listing-id) ERR_INVALID_LISTING))
      (buyer tx-sender)
    )
    (asserts! (>= (stx-get-balance buyer) (get price listing)) ERR_INSUFFICIENT_BALANCE)
    (asserts! (< block-height (get expiration listing)) ERR_INVALID_LISTING)
    (try! (stx-transfer? (get price listing) buyer (get seller listing)))
    (try! (as-contract (ft-transfer? quantum-energy-token (get amount listing) tx-sender buyer)))
    (map-delete energy-listings listing-id)
    (ok true)
  )
)

(define-public (cancel-listing (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? energy-listings listing-id) ERR_INVALID_LISTING))
    )
    (asserts! (is-eq tx-sender (get seller listing)) ERR_NOT_AUTHORIZED)
    (try! (as-contract (ft-transfer? quantum-energy-token (get amount listing) tx-sender (get seller listing))))
    (map-delete energy-listings listing-id)
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-listing (listing-id uint))
  (map-get? energy-listings listing-id)
)

(define-read-only (get-listing-count)
  (var-get listing-count)
)

