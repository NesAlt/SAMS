import axios from "../../utils/axiosInstance";
import { useState, useEffect } from "react";
import EventModal from "../../components/EventModal.jsx";
import "./AdminEventManager.css";

const AdminEventManager = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        const { data } = await axios.get("/adminUser/get_events");
        if (!isMounted) return;

        const formatted = data.map((event) => ({
          ...event,
          date: new Date(event.date).toISOString().split("T")[0],
          endDate: event.endDate
            ? new Date(event.endDate).toISOString().split("T")[0]
            : "",
        }));
        setEvents(formatted);
      } catch (err) {
        if (isMounted) console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const openAddModal = () => {
    setSelectedEvent(null);
    setMode("add");
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setMode("edit");
    setIsModalOpen(true);
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`/adminUser/del_event/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Failed to delete event. Please try again.");
    }
  };

  return (
    <div className="admin-event-manager">
      <h2>Event Manager</h2>

      <div className="button-group">
        <button onClick={openAddModal}>Add New Event</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e._id}>
              <td>{e.title}</td>
              <td className="capitalize">{e.type}</td>
              <td>{e.date ? new Date(e.date).toLocaleDateString() : "-"}</td>
              <td>{e.endDate ? new Date(e.endDate).toLocaleDateString() : "-"}</td>
              <td>{e.description || "—"}</td>
              <td>
                <button onClick={() => openEditModal(e)}>Edit</button>
                <button className="btn_del" onClick={() => deleteEvent(e._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={mode}
        initialData={selectedEvent}
        onSubmit={async (formData) => {
          try {
            let newOrUpdatedEvent;

            if (mode === "edit") {
              const res = await axios.put(`/adminUser/update_event/${selectedEvent._id}`, formData);
              newOrUpdatedEvent = res.data.event ? res.data.event : res.data;
            } else {
              const { data } = await axios.post(`/adminUser/event_add`, formData);
              newOrUpdatedEvent = data.event ? data.event : data;
            }

            const formattedEvent = {
              ...newOrUpdatedEvent,
              date: newOrUpdatedEvent.date
                ? new Date(newOrUpdatedEvent.date).toISOString().split("T")[0]
                : "",
              endDate: newOrUpdatedEvent.endDate
                ? new Date(newOrUpdatedEvent.endDate).toISOString().split("T")[0]
                : "",
            };

            setEvents((prev) =>
              mode === "edit"
                ? prev.map((e) => (e._id === selectedEvent._id ? formattedEvent : e))
                : [...prev, formattedEvent]
            );

            setIsModalOpen(false);
          } catch (err) {
            console.error("Error saving event:", err);
            alert("Failed to save event.");
          }
        }}
      />
    </div>
  );
};

export default AdminEventManager;