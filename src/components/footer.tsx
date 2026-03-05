export function Footer() {
  return (
    <footer className="border-t border-sand-300 mt-16">
      <div className="max-w-4xl mx-auto px-6 py-6 text-sm text-warmgray">
        <p>
          clock.email is a tool by the{" "}
          <a
            href="https://wildestfuture.com/lab"
            className="text-sand-700 hover:text-bronze transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wildest Future Lab
          </a>
          .
        </p>
        <p className="mt-1">
          Government response time, made visible. Open source.
        </p>
      </div>
    </footer>
  );
}
