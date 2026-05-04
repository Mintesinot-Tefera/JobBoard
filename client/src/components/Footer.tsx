export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About Us</h3>
          <p>
            Job Board is a platform connecting talented professionals with top
            companies. We make it easy to find your next career opportunity or
            hire the perfect candidate for your team.
          </p>
        </div>

        <div className="footer-section">
          <h3>Features</h3>
          <ul>
            <li>Browse jobs by category</li>
            <li>Create your professional profile</li>
            <li>Post open positions</li>
            <li>Track your applications</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <ul>
            <li>
              <a href="mailto:support@jobboard.com">support@jobboard.com</a>
            </li>
            <li>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Job Board. All rights reserved.</p>
      </div>
    </footer>
  );
}
