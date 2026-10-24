import { useState, useEffect } from 'react';
import './MarketPlace.css';
import API from '../../api/axios.js';
import { Search, RefreshCw, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

export default function MarketPlace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  const categories = [
    { name: 'All', icon: '🛒' },
    { name: 'Seeds', icon: '🌱' },
    { name: 'Fertilizers', icon: '🧪' },
    { name: 'Irrigation', icon: '💧' },
    { name: 'Equipment', icon: '🛠️' },
  ];

  const convertBackendToFrontendProducts = (backendData) => {
    if (!backendData || !Array.isArray(backendData)) return [];
    return backendData.map((item, index) => ({
      id: item.id || `p${index + 1}`,
      name: item.name || item.product_name || 'Agricultural Item',
      category: item.category || item.category_name || 'General',
      price: item.price || item.unit_price || 'ETB --',
      icon: item.icon || '📦',
      description: item.description || 'Quality agricultural input sourced locally.',
    }));
  };

  useEffect(() => {
    const loadMarketplaceData = async () => {
      setIsLoading(true);
      setStatusMessage(null);

      try {
        const response = await API.get('/marketplace/');
        console.log('Marketplace data from backend:', response.data);

        if (response.data) {
          const productList = Array.isArray(response.data) ? response.data : (response.data.products || []);
          setProducts(convertBackendToFrontendProducts(productList));
        }
      } catch (err) {
        console.error('Failed to fetch marketplace data:', err.response?.data || err.message);
        setStatusMessage({
          type: 'error',
          text: err.response?.data?.detail || 'Could not fetch live market prices. Showing default listings.',
        });

        setProducts([
          {
            id: 'p1',
            name: 'Urea Fertilizer',
            category: 'Fertilizers',
            price: 'ETB 4,200',
            icon: '🧪',
            description: 'High-nitrogen fertilizer suitable for cereals like Teff and Maize.',
          },
          {
            id: 'p2',
            name: 'Maize Seeds (BH-661)',
            category: 'Seeds',
            price: 'ETB 1,850',
            icon: '🌱',
            description: 'High-yield hybrid maize seed variety tailored for mid-altitude regions.',
          },
          {
            id: 'p3',
            name: 'Drip Irrigation Kit',
            category: 'Irrigation',
            price: 'ETB 12,500',
            icon: '💧',
            description: 'Complete gravity-fed drip kit coverage for up to 500 sqm.',
          },
          {
            id: 'p4',
            name: 'Manual Knapsack Sprayer',
            category: 'Equipment',
            price: 'ETB 3,100',
            icon: '🛠️',
            description: '16L capacity durable sprayer for crop protection and pest control.',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMarketplaceData();
  }, []);

  const filteredProducts = products.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="marketplace-container">
      <header className="marketplace-header">
        <h1 className="main-title">Agricultural Marketplace</h1>
        <p className="sub-title">Real-time market prices and agricultural inputs</p>
      </header>

      {statusMessage && (
        <div className={`status-toast ${statusMessage.type}`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="search-section">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="category-filter-group">
        {categories.map((cat) => (
          <button
            key={cat.name}
            className={`category-badge ${selectedCategory === cat.name ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.name)}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-card">
          <RefreshCw size={22} className="spin" />
          <span>Fetching current market prices...</span>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="no-products-text">No products found matching your filter.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="product-card">
      <div className="product-card-header">
        <span className="product-icon">{product.icon}</span>
        <div className="product-title-group">
          <h3 className="product-name">{product.name}</h3>
          <span className="product-category">{product.category}</span>
        </div>
      </div>

      <div className="product-price-tag">
        <span className="price-label">Current Price</span>
        <span className="price-amount">{product.price}</span>
      </div>

      {showDetails && (
        <p className="product-description">{product.description}</p>
      )}

      <button className="view-btn" onClick={() => setShowDetails(!showDetails)}>
        <Eye size={16} />
        <span>{showDetails ? 'Close' : 'View'}</span>
      </button>
    </div>
  );
}