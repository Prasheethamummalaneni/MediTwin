import { useEffect, useState } from "react";
import { getHealthTimeline, viewMedicalRecord } from "../services/Api";

function Timeline() {
  const patientId = 1;
  const [timelineItems, setTimelineItems] = useState([]);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      const data = await getHealthTimeline(patientId);

      const formattedItems = data.timeline.map((item) => ({
        id: item[0],
        name: item[1],
        category: item[2],
        date: item[3],
        hospital: "MediTwin",
        icon: getIcon(item[2]),
      }));

      setTimelineItems(formattedItems);
    } catch (error) {
      console.error("Failed to load health timeline:", error);
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case "Lab Report":
        return "🩸";

      case "Health Report":
        return "📋";

      case "Prescription":
        return "💊";

      case "Imaging":
        return "🩻";

      case "Diagnosis":
        return "🩺";

      default:
        return "📄";
    }
  };

  const handleView = (recordId) => {
    window.open(
      viewMedicalRecord(recordId),
      "_blank"
    );
  };

  return (
    <div className="timeline-page">

      {/* Page Header */}
      <section className="timeline-page-header">

        <div>
          <h1>Health Timeline</h1>

          <p>
            Track your medical history and health activities over time.
          </p>
        </div>

        <div className="timeline-summary glass-card">

          <span>📅</span>

          <div>
            <strong>{timelineItems.length}</strong>
            <small>Health Events</small>
          </div>

        </div>

      </section>


      {/* Timeline */}
      <section className="timeline-container glass-card">

        <div className="timeline-title">

          <div>
            <h2>Your Health Journey</h2>

            <p>
              A chronological view of your medical records and activities.
            </p>
          </div>

        </div>


        <div className="timeline">

          {timelineItems.length > 0 ? (

            timelineItems.map((item) => (

              <div
                className="timeline-item"
                key={item.id}
              >

                {/* Timeline Marker */}
                <div className="timeline-marker">

                  <span>
                    {item.icon}
                  </span>

                </div>


                {/* Timeline Content */}
                <div className="timeline-content glass-card">

                  <div className="timeline-content-top">

                    <div>

                      <span className="timeline-date">
                        {item.date}
                      </span>

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        {item.hospital}
                      </p>

                    </div>

                    <span className="timeline-category">
                      {item.category}
                    </span>

                  </div>


                  {/* View Button */}
                  <div className="timeline-action">

                    <button
                      onClick={() => handleView(item.id)}
                    >
                      View Details
                    </button>

                  </div>

                </div>

              </div>

            ))

          ) : (

            <div className="no-records glass-card">

              <div>📅</div>

              <h3>
                No health events found
              </h3>

              <p>
                Your medical history will appear here after records are added.
              </p>

            </div>

          )}

        </div>

      </section>

    </div>
  );
}

export default Timeline;