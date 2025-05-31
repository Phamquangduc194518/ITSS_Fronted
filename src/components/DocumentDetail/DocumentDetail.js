import React, { useEffect, useState } from 'react';
import {
  Card, Typography, Space, Tag, Button, Divider,
  Row, Col, Descriptions, Spin, Modal, List,
  Avatar, Form, Input, Rate, message
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CloseOutlined,
  LikeOutlined,
  DislikeOutlined,
  SendOutlined
} from '@ant-design/icons';
import './DocumentDetail.scss';
import { createRating, getComment, getDocumentById, reactToComment } from '../../auth/authAPI';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';


const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const DocumentDetail = () => {
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentForm] = Form.useForm();
  const [rating, setRating] = useState(0);
  const { user } = useSelector(state => state.auth);
  const { id } = useParams();
  const [commentLikes, setCommentLikes] = useState({});

  useEffect(() => {
    async function fetchComment() {
      try {
        const res = await getComment(id);
        setComments(res.data.data);
        const likeState = {};
        res.data.data.forEach(c => {
          likeState[c.id] = {
            liked: c.my_reaction === 'like',
            disliked: c.my_reaction === 'dislike',
            likes: c.like_count,
            dislikes: c.dislike_count
          };
        });
        setCommentLikes(likeState);
      } catch (error) {
        console.error('Lỗi khi lấy comment:', error);
      }
    }
    if (id) {
      fetchComment();
    }
  }, [id])

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

  const handleCommentSubmit = async (values) => {
    if (!values.content.trim()) {
      message.error('Vui lòng nhập nội dung bình luận');
      return;
    }
    if (rating === 0) {
      message.error('Vui lòng đánh giá tài liệu');
      return;
    }
    try {
    await createRating({
      document_id: id,
      content: values.content,
      rating: rating
    });

    message.success('Bình luận đã được gửi');
    commentForm.resetFields();
    setRating(0);
    const res = await getComment(id);
    setComments(res.data.data);
  } catch (error) {
    console.error('Lỗi khi gửi bình luận:', error);
    message.error('Gửi bình luận thất bại');
  }


  };

  const handleLike = async (commentId) => {
    try {
      await reactToComment(commentId, user?.id, 'like');
      const res = await getComment(id);
      setComments(res.data.data);
      const likeState = {};
      res.data.data.forEach(c => {
        likeState[c.id] = {
          liked: c.my_reaction === 'like',
          disliked: c.my_reaction === 'dislike',
          likes: c.like_count,
          dislikes: c.dislike_count
        };
      });
      setCommentLikes(likeState);
    } catch (err) {
      message.error('Lỗi khi like comment');
    }
  };

  const handleDislike = async (commentId) => {
    try {
      await reactToComment(commentId, user?.id, 'dislike');
      const res = await getComment(id);
      setComments(res.data.data);
      const likeState = {};
      res.data.data.forEach(c => {
        likeState[c.id] = {
          liked: c.my_reaction === 'like',
          disliked: c.my_reaction === 'dislike',
          likes: c.like_count,
          dislikes: c.dislike_count
        };
      });
      setCommentLikes(likeState);
    } catch (err) {
      message.error('Lỗi khi dislike comment');
    }
  };

  const CommentItem = ({ id, author, avatar, content, datetime, rating }) => (
    <div className="comment-item-pro">
      <Avatar src={avatar} alt={author} size={48} className="comment-avatar" />
      <div className="comment-content-wrap">
        <div className="comment-header-pro">
          <span className="comment-author-pro">{author}</span>
          <span className="comment-dot">·</span>
          <span className="comment-time-pro">{datetime}</span>
          <Rate disabled value={rating} className="comment-rate-pro" />
        </div>
        <div className="comment-text-pro">{content}</div>
        <div className="comment-actions-pro">
          <Button
            type="text"
            size="small"
            onClick={() => handleLike(id)}
            style={{ color: commentLikes[id]?.liked ? '#1890ff' : undefined }}
          >
            <LikeOutlined />
            Thích {commentLikes[id]?.likes > 0 ? commentLikes[id].likes : ''}
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => handleDislike(id)}
            style={{ color: commentLikes[id]?.disliked ? '#ff4d4f' : undefined }}
          >
            <DislikeOutlined />
            Không thích {commentLikes[id]?.dislikes > 0 ? commentLikes[id].dislikes : ''}
          </Button>
        </div>
      </div>
    </div>
  );

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
      <Card className="main-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="document-header">
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={4}>
                <div className="document-icon">
                  {doc.imgUrl? (
                    <img
                      src={doc.imgUrl}
                      alt={doc.title}
                      className="document-cover"
                    />
                  ) : (
                    <FileTextOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
                  )}
                </div>
              </Col>
              <Col xs={24} md={20}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Title level={2} style={{ margin: 0 }}>{doc.title}</Title>
                  <Space wrap>
                    <Tag color="blue">{doc.Course?.Department?.Faculty?.name}</Tag>
                    <Tag color="green">{doc.Course?.Department?.name}</Tag>
                    <Tag color="purple">{doc.Course?.name}</Tag>
                    <Text type="secondary">
                      <ClockCircleOutlined /> {new Date(doc.createdAt).toLocaleDateString()}
                    </Text>
                  </Space>
                </Space>
              </Col>
            </Row>
          </div>

          <Divider />

          <Row gutter={[24, 24]}>
            <Col xs={24} md={16}>
              <Card className="info-card">
                <Descriptions title="Thông tin chi tiết" bordered column={1}>
                  <Descriptions.Item label="Tác giả" span={3}>
                    <div className="author-info">
                      <Avatar
                        src={doc.User?.avatar_url}
                        alt={doc.User?.username}
                        size={56}
                        className="author-avatar"
                      />
                      <div className="author-meta">
                        <div className="author-name">{doc.User?.username || 'Chưa cập nhật'}</div>
                        <div className="author-email">{doc.User?.email || ''}</div>
                      </div>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại file">{doc.fileType || 'PDF'}</Descriptions.Item>
                  <Descriptions.Item label="Kích thước">{doc.fileSize || 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Mô tả" span={3}>
                    <Paragraph>{doc.description || 'Chưa có mô tả'}</Paragraph>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="action-card">
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

          {/* Comments Section */}
          <Card className="comments-card">
            <Title level={4}>Đánh giá và bình luận</Title>
            <Form
              form={commentForm}
              onFinish={handleCommentSubmit}
              className="comment-form"
            >
              <Form.Item name="rating" label="Đánh giá của bạn">
                <Rate onChange={setRating} value={rating} />
              </Form.Item>
              <Form.Item name="content">
                <TextArea
                  rows={4}
                  placeholder="Viết bình luận của bạn..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                >
                  Gửi bình luận
                </Button>
              </Form.Item>
            </Form>

            <List
              className="comment-list"
              header={`${comments.length} bình luận`}
              itemLayout="vertical"
              dataSource={comments}
              renderItem={item => (
                <List.Item>
                  <CommentItem
                    id={item.id}
                    author={item.User?.username}
                    avatar={item.User?.avatar_url}
                    content={item.content}
                    datetime={new Date(item.createdAt).toLocaleString()}
                    rating={item.rating}
                  />
                </List.Item>
              )}
            />
          </Card>
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
