import React from 'react'

const LOADING_DELAY_MS = 200

/**
 * Pass a function that returns the promise to be executed.
 */
export default function usePromise(getPromise) {
  const [loading, setLoading] = React.useState()
  const [error, setError] = React.useState()
  const [value, setValue] = React.useState()

  // Will throw an error if hooks are used after unmount.
  React.useEffect(() => {
    let mounted = true
    // If it takes less than the delay, don't show the loading indicator
    const loadingTimeoutId = setTimeout(() => {
      setLoading((loading) => (loading === undefined ? true : undefined))
    }, LOADING_DELAY_MS)

    getPromise()
      .then((v) => mounted && setValue(v))
      .catch((e) => {
        console.error('Error in initial fetch', e)
        if (mounted) setError(e)
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      clearTimeout(loadingTimeoutId)
      mounted = false
    }
  }, [getPromise])

  return [loading, error, value]
}
