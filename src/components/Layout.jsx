// src/components/Layout.jsx
// Layout.jsx
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1 overflow-hidden">
        <Sidebar />
        <main className="flex-grow-1 d-flex flex-column p-4 bg-light">
          {children}
        </main>
      </div>
    </div>
  );
}
