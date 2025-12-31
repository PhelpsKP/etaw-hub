export function Container({ children, maxWidth = 'var(--maxw-container)' }) {
  return (
    <div style={{
      maxWidth,
      margin: '0 auto',
      padding: '0 var(--space-xl)',
      width: '100%'
    }} className="container-responsive">
      {children}
    </div>
  );
}
