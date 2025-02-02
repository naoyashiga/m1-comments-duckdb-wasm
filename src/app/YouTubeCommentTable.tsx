import React from 'react';

interface YouTubeComment {
  cid: string;
  text: string;
  time: string;
  author: string;
  channel: string;
  votes: string;
  replies: string;
  photo: string;
  heart: boolean;
  reply: boolean;
  time_parsed: number;
}

interface YouTubeCommentTableProps {
  comments: YouTubeComment[];
}

const tableStyles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: '20px',
  },
  th: {
    // backgroundColor: '#f5f5f5',
    padding: '12px',
    textAlign: 'left' as const,
    borderBottom: '2px solid #ddd'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #ddd',
    maxWidth: '400px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    textAlign: 'left' as const
  },
  authorCell: {
    width: '150px'
  },
  timeCell: {
    width: '100px'
  },
  votesCell: {
    width: '80px',
    textAlign: 'right' as const
  }
};

const YouTubeCommentTable: React.FC<YouTubeCommentTableProps> = ({ comments }) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyles.table}>
        <thead>
          <tr>
            <th style={tableStyles.th}>投稿者</th>
            <th style={tableStyles.th}>投稿時間</th>
            <th style={tableStyles.th}>いいね数</th>
            <th style={tableStyles.th}>コメント</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => (
            <tr key={comment.cid}>
              <td style={{ ...tableStyles.td, ...tableStyles.authorCell }}>
                {comment.author}
              </td>
              <td style={{ ...tableStyles.td, ...tableStyles.timeCell }}>
                {comment.time}
              </td>
              <td style={{ ...tableStyles.td, ...tableStyles.votesCell }}>
                {comment.votes}
              </td>
              <td style={tableStyles.td} title={comment.text}>
                {comment.text}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default YouTubeCommentTable;