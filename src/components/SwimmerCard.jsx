export default function SwimmerCard({ swimmer }) {
    return (
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h3>{swimmer.name}</h3>
        <p><strong>DOB:</strong> {swimmer.dob}</p>
        <p><strong>Gender:</strong> {swimmer.gender}</p>
  
        <h4>Recent Times</h4>
        <ul>
          {swimmer.times.map((entry, index) => (
            <li key={index}>
              {entry.event} — {entry.time} ({entry.date})
            </li>
          ))}
        </ul>
      </div>
    );
  }