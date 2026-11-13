import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <p className="text-8xl mb-4">🔍</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          404
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/')}
                  className="btn-primary">
            Go Home
          </button>
          <button onClick={() => navigate('/items')}
                  className="btn-secondary">
            Browse Items
          </button>
        </div>
      </div>
    </div>
  )
}