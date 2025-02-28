// PropertyListing.js
import React, { useState, useEffect } from 'react';
import { Card, List, Button, Typography, Tag, Row, Col, Select} from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import './propstyle.css';

const { Title, Text } = Typography;
const {Option}=Select 


const PropertyListing = () => {
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

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      let query = supabase.from('properties').select('*').order('created_at', { ascending: false });

      // Apply BHK Type filter
      if (filters.bhkType.length > 0) {
        query = query.ilike('bedroom_config', `%${filters.bhkType.join('|')}%`);
      }

      // Apply Price Range filter
      query = query.gte('price_range->min', filters.priceRange[0])
        .lte('price_range->max', filters.priceRange[1]);

      // Apply Property Status filter
      if (filters.propertyStatus.length > 0) {
        query = query.in('status', filters.propertyStatus);
      }

      // Apply Property Type filter (assuming 'Apartment' is default; adjust based on your data)
      if (filters.propertyType.length > 0) {
        query = query.ilike('title', `%${filters.propertyType.join('|')}%`);
      }

      // Apply Sale Type and Construction Status (simplified; adjust based on your data structure)
      if (filters.saleType.length > 0 || filters.constructionStatus.length > 0) {
        // Add logic here based on your schema if needed
      }

      // Apply Parking filter (simplified; adjust based on your data structure)
      if (filters.parking.length > 0) {
        // Add logic here if parking data exists in your schema
      }

      const { data, error } = await query.limit(30);

      if (error) throw error;
      setProperties(data || []);
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
      {/* Top Bar Filters */}
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
          <Button icon={<img src="https://img.icons8.com/?size=100&id=609&format=png" alt="Expert Pro Agents" style={{ width: 20, height: 20 }} />} style={{ border: 'none', padding: '0 8px' }}>
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

      {/* Property Listings */}
      <Row gutter={[16, 16]}>
        {properties.map((property) => (
          <Col
            key={property.id}
            xs={24}  // 1 card on mobile (< 576px)
            sm={12}  // 2 cards on tablets (576px–768px)
            md={8}   // 3 cards on small desktops (768px–992px)
            lg={6}   // 4 cards on large desktops (> 992px)
          >
            <Card
              cover={
                <img
                  alt={property.title}
                  src={property.image_url || 'https://picsum.photos/300/200?random'}
                  style={{ objectFit: 'cover', height: 200, width: '100%' }}
                />
              }
              actions={[
                <Tag color="red">New Launch</Tag>,
                <Button type="primary" shape="round" size="large">
                  Contact
                </Button>,
              ]}
            >
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
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default PropertyListing;