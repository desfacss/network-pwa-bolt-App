// MapView.js
// import React, { useState, useEffect } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { Card, Row, Col, Select, Button, Typography, Tag } from 'antd';
// import { supabase } from 'configs/SupabaseConfig';
// import './propstyle.css';

// const { Title, Text } = Typography;
// const { Option } = Select;

// // Custom icon for markers (optional, using Leaflet's default marker)
// const customIcon = new L.Icon({
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41],
// });

// const MapView = () => {
//   const [properties, setProperties] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     bhkType: [],
//     priceRange: [0, 50000000], // ₹0 - ₹5Cr in rupees
//     propertyStatus: [],
//     propertyType: [],
//     saleType: [],
//     constructionStatus: [],
//     parking: [],
//   });
//   const [center, setCenter] = useState([12.9716, 77.5946]); // Default to Bangalore (Electronic City)

//   useEffect(() => {
//     fetchProperties();
//   }, [filters]);

//   const fetchProperties = async () => {
//     try {
//       let query = supabase.from('properties').select('*').order('created_at', { ascending: false });

//       // Apply BHK Type filter
//       if (filters.bhkType.length > 0) {
//         query = query.ilike('bedroom_config', `%${filters.bhkType.join('|')}%`);
//       }

//       // Apply Price Range filter
//       query = query.gte('price_range->min', filters.priceRange[0])
//         .lte('price_range->max', filters.priceRange[1]);

//       // Apply Property Status filter
//       if (filters.propertyStatus.length > 0) {
//         query = query.in('status', filters.propertyStatus);
//       }

//       // Apply Property Type filter (assuming 'Apartment' is default; adjust based on your data)
//       if (filters.propertyType.length > 0) {
//         query = query.ilike('title', `%${filters.propertyType.join('|')}%`);
//       }

//       // Apply Sale Type and Construction Status (simplified; adjust based on your data structure)
//       if (filters.saleType.length > 0 || filters.constructionStatus.length > 0) {
//         // Add logic here based on your schema if needed
//       }

//       // Apply Parking filter (simplified; adjust based on your data structure)
//       if (filters.parking.length > 0) {
//         // Add logic here if parking data exists in your schema
//       }

//       const { data, error } = await query.limit(30);

//       if (error) throw error;
//       setProperties(data || []);

//       // Update map center based on first property's location (if available)
//       if (data && data.length > 0) {
//         setCenter([data[0].lat, data[0].long]);
//       }
//     } catch (error) {
//       console.error('Error fetching properties:', error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatPrice = (price) => {
//     if (typeof price === 'object' && price.min && price.max) {
//       return `₹${price.min / 100000} L - ₹${price.max / 100000} Cr`;
//     }
//     return `₹${price / 100000} L`;
//   };

//   const getBedroomDetails = (bedroomConfig) => {
//     const details = [];
//     for (const [bhk, config] of Object.entries(bedroomConfig)) {
//       details.push(
//         <div key={bhk} style={{ marginBottom: 4 }}>
//           {bhk} Flat - {formatPrice(config.price)}
//         </div>
//       );
//     }
//     return details;
//   };

//   const formatPossessionDate = (date) => {
//     if (!date) return 'TBD';
//     if (date instanceof Date) {
//       return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
//     }
//     const parsedDate = new Date(date);
//     return isNaN(parsedDate.getTime()) ? 'TBD' : parsedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
//   };

//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({ ...prev, [key]: value }));
//   };

//   return (
//     <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
//       {/* Top Bar Filters (matching PropertyListing.js) */}
//       <Row gutter={[8, 8]} align="middle" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
//         <Col>
//           <Select
//             placeholder="Property Type"
//             style={{ width: 150 }}
//             onChange={(value) => handleFilterChange('propertyType', value ? [value] : [])}
//             allowClear
//           >
//             <Option value="Apartment">Apartment</Option>
//             <Option value="House/Villa">Independent House/Villa</Option>
//             <Option value="Gated Community Villa">Gated Community Villa</Option>
//             <Option value="Standalone Building">Standalone Building</Option>
//           </Select>
//         </Col>
//         <Col>
//           <Select
//             placeholder="BHK Type"
//             style={{ width: 120 }}
//             mode="multiple"
//             onChange={(value) => handleFilterChange('bhkType', value)}
//             allowClear
//           >
//             <Option value="1RK">1 RK</Option>
//             <Option value="1BHK">1 BHK</Option>
//             <Option value="2BHK">2 BHK</Option>
//             <Option value="3BHK">3 BHK</Option>
//             <Option value="4BHK">4 BHK</Option>
//             <Option value="4+BHK">4+ BHK</Option>
//           </Select>
//         </Col>
//         <Col>
//           <Select
//             placeholder="₹0 - ₹5Cr"
//             style={{ width: 120 }}
//             onChange={(value) => handleFilterChange('priceRange', value || [0, 50000000])}
//             allowClear
//           >
//             <Option value={[0, 50000000]}>₹0 - ₹5Cr</Option>
//             <Option value={[50000000, 100000000]}>₹5Cr - ₹10Cr</Option>
//           </Select>
//         </Col>
//         <Col>
//           <Select
//             placeholder="Sale Type"
//             style={{ width: 120 }}
//             onChange={(value) => handleFilterChange('saleType', value ? [value] : [])}
//             allowClear
//           >
//             <Option value="New">New</Option>
//             <Option value="Resale">Resale</Option>
//           </Select>
//         </Col>
//         <Col>
//           <Select
//             placeholder="Construction St..."
//             style={{ width: 150 }}
//             onChange={(value) => handleFilterChange('constructionStatus', value ? [value] : [])}
//             allowClear
//           >
//             <Option value="Under Construction">Under Construction</Option>
//             <Option value="Ready">Ready</Option>
//           </Select>
//         </Col>
//         <Col>
//           <Select
//             placeholder="Project"
//             style={{ width: 120 }}
//             onChange={(value) => handleFilterChange('project', value ? [value] : [])}
//             allowClear
//           >
//             <Option value="Signature Heights">Signature Heights</Option>
//             <Option value="Skyline Towers">Skyline Towers</Option>
//           </Select>
//         </Col>
//         <Col>
//           <Button icon={<img src="https://img.icons8.com/?size=100&id=609&format=png" alt="Expert Pro Agents" style={{ width: 20, height: 20 }} />} style={{ border: 'none', padding: '0 8px' }}>
//             Expert Pro Agents
//           </Button>
//         </Col>
//         <Col>
//           <Select
//             placeholder="More Filters"
//             style={{ width: 120 }}
//             onChange={(value) => handleFilterChange('moreFilters', value ? [value] : [])}
//             allowClear
//           >
//             <Option value="Parking">Parking</Option>
//             <Option value="Furnishing">Furnishing</Option>
//           </Select>
//         </Col>
//         <Col>
//           <Button type="primary" shape="round" style={{ background: '#722ed1', borderColor: '#722ed1' }}>
//             Save Search
//           </Button>
//         </Col>
//       </Row>

//       {/* Map Container */}
//       <div style={{ height: '600px', width: '100%' }}>
//         <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           />
//           {properties.map((property) => (
//             property.lat && property.long && (
//               <Marker
//                 key={property.id}
//                 position={[property.lat, property.long]}
//                 icon={customIcon}
//               >
//                 <Popup>
//                   <Card style={{ width: 300 }}>
//                     <Card.Meta
//                       title={
//                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
//                           <Text strong>{property.title}</Text>
//                           <Tag color="success">RERA</Tag>
//                         </div>
//                       }
//                       description={
//                         <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
//                           {getBedroomDetails(property.bedroom_config)}
//                           <Text type="secondary" style={{ marginTop: 8, lineHeight: 1.5 }}>
//                             Avg. Price: ₹{property.avg_price_per_sqft} K/sq.ft • Sizes: {property.sizes.min} - {property.sizes.max} sq.ft • {property.status} • Possession: {formatPossessionDate(property.possession_date)}
//                           </Text>
//                           <Text type="secondary" style={{ marginTop: 8 }}>
//                             Developer: {property.developer}
//                           </Text>
//                           <Text type="secondary" style={{ marginTop: 8 }}>
//                             {Math.floor(Math.random() * 5) + 1}d ago
//                           </Text>
//                         </div>
//                       }
//                     />
//                   </Card>
//                 </Popup>
//               </Marker>
//             )
//           ))}
//         </MapContainer>
//       </div>
//     </div>
//   );
// };

// export default MapView;


// MapView.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, Row, Col, Select, Button, Typography, Tag } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import './propstyle.css';

const { Title, Text } = Typography;
const { Option } = Select;

// Custom icon for markers
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapView = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    bhkType: [],
    priceRange: [0, 50000000], // ₹0 - ₹5Cr in rupees
    propertyStatus: [],
    propertyType: [],
    saleType: [],
    constructionStatus: [],
    parking: [],
  });
  const [center, setCenter] = useState([12.9716, 77.5946]); // Default to Bangalore (Electronic City)

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      let query = supabase.from('properties').select('*').order('created_at', { ascending: false });

      if (filters.bhkType.length > 0) {
        query = query.ilike('bedroom_config', `%${filters.bhkType.join('|')}%`);
      }

      query = query.gte('price_range->min', filters.priceRange[0])
        .lte('price_range->max', filters.priceRange[1]);

      if (filters.propertyStatus.length > 0) {
        query = query.in('status', filters.propertyStatus);
      }

      if (filters.propertyType.length > 0) {
        query = query.ilike('title', `%${filters.propertyType.join('|')}%`);
      }

      if (filters.saleType.length > 0 || filters.constructionStatus.length > 0) {
        // Add logic here based on your schema if needed
      }

      if (filters.parking.length > 0) {
        // Add logic here if parking data exists in your schema
      }

      const { data, error } = await query.limit(30);

      if (error) throw error;
      setProperties(data || []);

      if (data && data.length > 0) {
        setCenter([data[0].lat, data[0].long]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (typeof price === 'object' && price.min && price.max) {
      return `₹${price.min / 100000} L - ₹${price.max / 100000} Cr`;
    }
    return `₹${price / 100000} L`;
  };

  const getBedroomDetails = (bedroomConfig) => {
    const details = [];
    for (const [bhk, config] of Object.entries(bedroomConfig)) {
      details.push(
        <div key={bhk} style={{ marginBottom: 4 }}>
          {bhk} Flat - {formatPrice(config.price)}
        </div>
      );
    }
    return details;
  };

  const formatPossessionDate = (date) => {
    if (!date) return 'TBD';
    if (date instanceof Date) {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? 'TBD' : parsedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
      <Row gutter={[8, 8]} align="middle" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        <Col>
          <Select
            placeholder="Property Type"
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('propertyType', value ? [value] : [])}
            allowClear
          >
            <Option value="Apartment">Apartment</Option>
            <Option value="House/Villa">Independent House/Villa</Option>
            <Option value="Gated Community Villa">Gated Community Villa</Option>
            <Option value="Standalone Building">Standalone Building</Option>
          </Select>
        </Col>
        <Col>
          <Select
            placeholder="BHK Type"
            style={{ width: 120 }}
            mode="multiple"
            onChange={(value) => handleFilterChange('bhkType', value)}
            allowClear
          >
            <Option value="1RK">1 RK</Option>
            <Option value="1BHK">1 BHK</Option>
            <Option value="2BHK">2 BHK</Option>
            <Option value="3BHK">3 BHK</Option>
            <Option value="4BHK">4 BHK</Option>
            <Option value="4+BHK">4+ BHK</Option>
          </Select>
        </Col>
        <Col>
          <Select
            placeholder="₹0 - ₹5Cr"
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange('priceRange', value || [0, 50000000])}
            allowClear
          >
            <Option value={[0, 50000000]}>₹0 - ₹5Cr</Option>
            <Option value={[50000000, 100000000]}>₹5Cr - ₹10Cr</Option>
          </Select>
        </Col>
        <Col>
          <Select
            placeholder="Sale Type"
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange('saleType', value ? [value] : [])}
            allowClear
          >
            <Option value="New">New</Option>
            <Option value="Resale">Resale</Option>
          </Select>
        </Col>
        <Col>
          <Select
            placeholder="Construction St..."
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('constructionStatus', value ? [value] : [])}
            allowClear
          >
            <Option value="Under Construction">Under Construction</Option>
            <Option value="Ready">Ready</Option>
          </Select>
        </Col>
        <Col>
          <Select
            placeholder="Project"
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange('project', value ? [value] : [])}
            allowClear
          >
            <Option value="Signature Heights">Signature Heights</Option>
            <Option value="Skyline Towers">Skyline Towers</Option>
          </Select>
        </Col>
        <Col>
          <Button icon={<img loading="lazy" src="https://img.icons8.com/?size=100&id=609&format=png" alt="Expert Pro Agents" style={{ width: 20, height: 20 }} />} style={{ border: 'none', padding: '0 8px' }}>
            Expert Pro Agents
          </Button>
        </Col>
        <Col>
          <Select
            placeholder="More Filters"
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange('moreFilters', value ? [value] : [])}
            allowClear
          >
            <Option value="Parking">Parking</Option>
            <Option value="Furnishing">Furnishing</Option>
          </Select>
        </Col>
        <Col>
          <Button type="primary" shape="round" style={{ background: '#722ed1', borderColor: '#722ed1' }}>
            Save Search
          </Button>
        </Col>
      </Row>

      <div style={{ height: '600px', width: '100%' }}>
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {properties.map((property) => (
            property.lat && property.long && (
              <Marker
                key={property.id}
                position={[property.lat, property.long]}
                icon={customIcon}
              >
                <Popup>
                  <Card style={{ width: 300 }}>
                    <Card.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text strong>{property.title}</Text>
                          <Tag color="success">RERA</Tag>
                        </div>
                      }
                      description={
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {getBedroomDetails(property.bedroom_config)}
                          <Text type="secondary" style={{ marginTop: 8, lineHeight: 1.5 }}>
                            Avg. Price: ₹{property.avg_price_per_sqft} K/sq.ft • Sizes: {property.sizes.min} - {property.sizes.max} sq.ft • {property.status} • Possession: {formatPossessionDate(property.possession_date)}
                          </Text>
                          <Text type="secondary" style={{ marginTop: 8 }}>
                            Developer: {property.developer}
                          </Text>
                          <Text type="secondary" style={{ marginTop: 8 }}>
                            {Math.floor(Math.random() * 5) + 1}d ago
                          </Text>
                        </div>
                      }
                    />
                  </Card>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;