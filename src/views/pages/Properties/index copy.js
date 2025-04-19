// PropertyListing.js
import React, { useState, useEffect } from 'react';
import { Card, List, Button, Typography, Tag, Row, Col } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import './propstyle.css';

const { Title, Text } = Typography;

const PropertyListing = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

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

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={2}>Flats for Sale in Electronic City, Bangalore</Title>
        <Text type="secondary">
          Showing 1 - 30 of 1498 | Looking for Property in Electronic City? Offers 1498+ Flats & 22+ Houses/Villas. Search from 1526+ 2 & 3 BHK properties for sale... read more
        </Text>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center' }}>
          <Text>Sort by:</Text>
          <select style={{ marginLeft: 10, padding: 5, borderRadius: 4, border: '1px solid #d9d9d9', minWidth: 150 }}>
            <option value="relevance">Relevance</option>
            <option value="price-low">Price (Low to High)</option>
            <option value="price-high">Price (High to Low)</option>
          </select>
        </div>
      </div>

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
                <img loading="lazy"
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