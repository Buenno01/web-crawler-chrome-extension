
/**
 * 
 * @returns {JSX.Element}
 * @param {Object} props
 * @param {string} props.title - Título da seção
 * @param {React.JSX.Element} props.icon - Ícone a ser renderizado
 * @param {React.ReactNode} props.children - Conteúdo da seção
 */
function SectionHeader({ title, icon: Icon, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="text-xl text-accent" />}
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default SectionHeader;