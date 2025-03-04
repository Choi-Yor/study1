import React from 'react';
import {
  Card as MuiCard,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Box,
  Divider,
  Chip,
  useTheme,
  Skeleton,
  CardActionArea,
  Tooltip
} from '@mui/material';
import { MoreVert as MoreIcon } from '@mui/icons-material';

interface CardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  content: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
  elevation?: number;
  variant?: 'outlined' | 'elevation';
  badges?: Array<{
    label: string;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  }>;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  content,
  actions,
  icon,
  headerAction,
  loading = false,
  onClick,
  elevation = 0,
  variant = 'outlined',
  badges = [],
}) => {
  const theme = useTheme();
  
  // 카드 컨텐츠 래퍼
  const cardContent = (
    <>
      {/* 카드 헤더 */}
      <CardHeader
        avatar={icon}
        title={
          loading ? (
            <Skeleton variant="text" width="80%" />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                {title}
              </Typography>
              
              {/* 뱃지 */}
              {badges.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {badges.map((badge, index) => (
                    <Chip
                      key={index}
                      label={badge.label}
                      color={badge.color || 'default'}
                      size="small"
                      sx={{ height: 20 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )
        }
        subheader={
          loading ? (
            <Skeleton variant="text" width="60%" />
          ) : subtitle ? (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null
        }
        action={
          loading ? (
            <Skeleton variant="circular" width={32} height={32} />
          ) : headerAction ? (
            headerAction
          ) : onClick ? null : (
            <Tooltip title="더 보기">
              <IconButton aria-label="settings" size="small">
                <MoreIcon />
              </IconButton>
            </Tooltip>
          )
        }
        sx={{
          p: 2,
          pb: 1,
          '& .MuiCardHeader-content': {
            overflow: 'hidden',
          },
          '& .MuiCardHeader-title': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        }}
      />

      {/* 카드 콘텐츠 */}
      <CardContent sx={{ p: 2, pt: 1 }}>
        {loading ? (
          <>
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="80%" />
          </>
        ) : (
          content
        )}
      </CardContent>

      {/* 카드 액션 */}
      {actions && (
        <>
          <Divider />
          <CardActions sx={{ p: 1.5 }}>
            {loading ? (
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                <Skeleton variant="rounded" width={80} height={32} />
                <Skeleton variant="rounded" width={80} height={32} />
              </Box>
            ) : (
              actions
            )}
          </CardActions>
        </>
      )}
    </>
  );

  // 클릭 가능한 카드인 경우
  if (onClick) {
    return (
      <MuiCard
        elevation={elevation}
        variant={variant}
        sx={{
          borderRadius: 2,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <CardActionArea onClick={onClick}>
          {cardContent}
        </CardActionArea>
      </MuiCard>
    );
  }

  // 일반 카드
  return (
    <MuiCard
      elevation={elevation}
      variant={variant}
      sx={{
        borderRadius: 2,
      }}
    >
      {cardContent}
    </MuiCard>
  );
};

export default Card;
