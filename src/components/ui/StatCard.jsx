import Box from './Box';

function StatCard({ title, value, icon: Icon, subtitle, variant = 'info', children }) {
  return (
    <Box.Root variant={variant}>
      <Box.Header className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {Icon && <Icon className="text-lg" />}
      </Box.Header>
      <Box.Content>
        <p className="text-2xl font-bold mb-1">{value}</p>
        {subtitle && <p className="text-sm">{subtitle}</p>}
        {children}
      </Box.Content>
    </Box.Root>
  );
}

export default StatCard;