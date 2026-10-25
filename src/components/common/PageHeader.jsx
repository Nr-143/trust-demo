export default function PageHeader({ title, titleTamil, description, children }) {
  return (
    <div className="bg-primary-dark text-white py-12 sm:py-16">
      <div className="site-container">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{title}</h1>
        {titleTamil && (
          <p className="mt-1 text-base sm:text-lg text-white/70 font-tamil">{titleTamil}</p>
        )}
        {description && (
          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
