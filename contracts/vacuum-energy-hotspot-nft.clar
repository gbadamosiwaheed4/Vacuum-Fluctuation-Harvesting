;; Vacuum Energy Hotspot NFT Contract

(define-non-fungible-token vacuum-energy-hotspot uint)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_NFT (err u101))

;; Data variables
(define-data-var last-token-id uint u0)

;; Data maps
(define-map token-metadata
  uint
  {
    discoverer: principal,
    location: (string-ascii 50),
    energy-density: uint,
    stability: uint,
    discovery-time: uint
  }
)

;; Public functions
(define-public (mint-hotspot (location (string-ascii 50)) (energy-density uint) (stability uint))
  (let
    (
      (token-id (+ (var-get last-token-id) u1))
    )
    (asserts! (and (>= stability u0) (<= stability u100)) ERR_NOT_AUTHORIZED)
    (try! (nft-mint? vacuum-energy-hotspot token-id tx-sender))
    (map-set token-metadata
      token-id
      {
        discoverer: tx-sender,
        location: location,
        energy-density: energy-density,
        stability: stability,
        discovery-time: block-height
      }
    )
    (var-set last-token-id token-id)
    (ok token-id)
  )
)

(define-public (transfer-hotspot (token-id uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender (unwrap! (nft-get-owner? vacuum-energy-hotspot token-id) ERR_INVALID_NFT)) ERR_NOT_AUTHORIZED)
    (try! (nft-transfer? vacuum-energy-hotspot token-id tx-sender recipient))
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-hotspot-metadata (token-id uint))
  (map-get? token-metadata token-id)
)

(define-read-only (get-hotspot-owner (token-id uint))
  (nft-get-owner? vacuum-energy-hotspot token-id)
)

(define-read-only (get-last-token-id)
  (var-get last-token-id)
)
