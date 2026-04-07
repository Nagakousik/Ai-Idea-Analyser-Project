import './skeletonloader.css';

const SkeletonLoader = ({ type = 'button' }) => {
  if (type === 'button') {
    return <div className="skeleton-button"></div>;
  }
  
  if (type === 'dashboard') {
    return (
      <div className="skeleton-dashboard">
        <div className="skeleton-column">
          <div className="skeleton-header"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text short"></div>
          <div className="skeleton-progress"></div>
        </div>
        <div className="skeleton-arrow"></div>
        <div className="skeleton-column">
          <div className="skeleton-header"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text short"></div>
          <div className="skeleton-progress"></div>
        </div>
      </div>
    );
  }
  
  return <div className="skeleton-default"></div>;
};

export default SkeletonLoader;