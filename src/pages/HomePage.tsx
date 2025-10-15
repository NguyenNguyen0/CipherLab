import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Cipher Tools</h1>
      <p className="text-center text-gray-600 mb-8">
        Welcome to Cipher Tools! Select a cipher method from the list below or from the navigation bar.
      </p>
      
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          to="/caesar"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 text-center"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Caesar Cipher</h2>
          <p className="text-gray-600">A simple substitution cipher that shifts letters by a fixed number.</p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;