import React from 'react'
import Button from '@mui/material/Button'

const Error = ({error}:any) => {
  return (
    <div>   <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center text-red-600 dark:text-red-400">
      <p className="mb-4">Error: {error}</p>
      <Button onClick={() => window.location.reload()}>Retry</Button>
    </div>
  </div></div>
  )
}

export default Error