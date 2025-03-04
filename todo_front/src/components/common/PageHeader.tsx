import React from 'react';
import { 
  Box, 
  Typography, 
  Breadcrumbs, 
  Link as MuiLink,
  Button,
  useTheme,
  Paper
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  action,
}) => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* 브레드크럼 */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return isLast ? (
              <Typography 
                key={index} 
                color="text.primary" 
                aria-current="page"
                variant="body2"
              >
                {crumb.label}
              </Typography>
            ) : (
              <MuiLink
                key={index}
                component={Link}
                href={crumb.href || '#'}
                underline="hover"
                color="inherit"
                variant="body2"
              >
                {crumb.label}
              </MuiLink>
            );
          })}
        </Breadcrumbs>
      )}

      {/* 헤더 콘텐츠 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {description}
            </Typography>
          )}
        </Box>

        {/* 액션 버튼 */}
        {action && (
          <Button
            variant="contained"
            color="primary"
            onClick={action.onClick}
            startIcon={action.icon}
          >
            {action.label}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default PageHeader;
