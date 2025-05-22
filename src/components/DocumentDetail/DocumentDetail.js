import React, { useEffect, useState } from 'react';
import {
  Card, Typography, Space, Tag, Button, Divider,
  Row, Col, Descriptions, Spin, Modal
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CloseOutlined
} from '@ant-design/icons';
import './DocumentDetail.scss';
import { getDocumentById } from '../../auth/authAPI';
import { useParams } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const DocumentDetail = () => {
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    async function fetchDoc() {
      try {
        const res = await getDocumentById(id);
        const data = res.data.data;
        setDoc(data);
        setDownloadCount(data.downloadCount || 0);
      } catch (err) {
        console.error('Fetch document error', err);
        setError('Không tìm thấy tài liệu');
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [id]);

  const handleDownload = () => {
    setDownloadCount(prev => prev + 1);
    if (doc?.file_path) {
      window.open(doc.file_path, '_blank');
    }
  };

  const handlePreview = () => {
    setPreviewVisible(true);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', height: '400px'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!doc) {
    return null;
  }

  return (
    <div className="document-detail-container">
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header Section */}
          <div className="document-header">
            <Space align="start">
              <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              <div>
                <Title level={2} style={{ margin: 0 }}>{doc.title}</Title>
                <Space>
                  <Tag color="blue">{doc.Course?.Department?.Faculty?.name}</Tag>
                  <Text type="secondary">
                    <ClockCircleOutlined /> {new Date(doc.createdAt).toLocaleDateString()}
                  </Text>
                </Space>
              </div>
            </Space>
          </div>

          <Divider />

          {/* Document Information */}
          <Row gutter={[24, 24]}>
            <Col xs={24} md={16}>
              <Descriptions title="Thông tin tài liệu" bordered>
                <Descriptions.Item label="Tác giả" span={3}>
                  <Space><UserOutlined /> {doc.author || 'Chưa cập nhật'}</Space>
                </Descriptions.Item>
                <Descriptions.Item label="Loại file">{doc.fileType || 'PDF'}</Descriptions.Item>
                <Descriptions.Item label="Kích thước">{doc.fileSize || 'Chưa cập nhật'}</Descriptions.Item>
                <Descriptions.Item label="Lượt tải">{downloadCount}</Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={3}>
                  <Paragraph>{doc.description || 'Chưa có mô tả'}</Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    block
                    size="large"
                    onClick={handleDownload}
                  >
                    Tải xuống
                  </Button>
                  <Button
                    icon={<EyeOutlined />}
                    block
                    size="large"
                    onClick={handlePreview}
                  >
                    Xem trước
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Space>
      </Card>

      <Modal
        title={doc.title}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width="90%"
        style={{ top: 20 }}
        footer={null}
        closeIcon={<CloseOutlined style={{ fontSize: '20px' }} />}
        bodyStyle={{ padding: '0', height: '80vh' }}
      >
        <iframe
          src={doc.file_path}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Document Preview"
        />
      </Modal>
    </div>
  );
};

export default DocumentDetail;
