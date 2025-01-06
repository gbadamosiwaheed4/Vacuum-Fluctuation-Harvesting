;; Particle Physics Integration Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_EXPERIMENT (err u101))

;; Data variables
(define-data-var experiment-count uint u0)

;; Data maps
(define-map particle-experiments
  uint
  {
    researcher: principal,
    experiment-type: (string-ascii 50),
    parameters: (list 10 {name: (string-ascii 20), value: int}),
    results: (optional (string-utf8 1000)),
    energy-consumed: uint,
    start-time: uint,
    end-time: (optional uint)
  }
)

;; Public functions
(define-public (start-experiment (experiment-type (string-ascii 50)) (parameters (list 10 {name: (string-ascii 20), value: int})))
  (let
    (
      (experiment-id (+ (var-get experiment-count) u1))
    )
    (map-set particle-experiments
      experiment-id
      {
        researcher: tx-sender,
        experiment-type: experiment-type,
        parameters: parameters,
        results: none,
        energy-consumed: u0,
        start-time: block-height,
        end-time: none
      }
    )
    (var-set experiment-count experiment-id)
    (ok experiment-id)
  )
)

(define-public (end-experiment (experiment-id uint) (results (string-utf8 1000)) (energy-consumed uint))
  (let
    (
      (experiment (unwrap! (map-get? particle-experiments experiment-id) ERR_INVALID_EXPERIMENT))
    )
    (asserts! (is-eq tx-sender (get researcher experiment)) ERR_NOT_AUTHORIZED)
    (ok (map-set particle-experiments
      experiment-id
      (merge experiment {
        results: (some results),
        energy-consumed: energy-consumed,
        end-time: (some block-height)
      })
    ))
  )
)

;; Read-only functions
(define-read-only (get-experiment (experiment-id uint))
  (map-get? particle-experiments experiment-id)
)

(define-read-only (get-experiment-count)
  (var-get experiment-count)
)

