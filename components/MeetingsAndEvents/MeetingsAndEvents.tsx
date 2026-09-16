"use client";

import React, { useState, useRef, useEffect } from "react";
import CallToAction from "../common/calltoaction";
import ImageGalleryModal from "../common/ImageGalleryModal";
import ImageCardSlider from "../common/ImageCardSlider";
import PageHero from "../common/pagehero";
import { useRooms } from "@/redux/hook/useRooms";
import { useApplication } from "@/redux/hook/useApplicationDetails";

export const Meetings = [
  {
    id: "1",
    name: "Boardroom Meeting",
    type: "Meeting",
    description:
      "Our sophisticated boardroom offers a perfect setting for focused discussions, strategic planning, and high-level business meetings...",
    images: ["/images/boardmeeting.webp", "/images/hallroom.webp"],
    heroImage: "/images/boardmeeting.webp",
    cuisine: ["International", "Fast Casual", "Beverages"],
    atmosphere: "Casual & Vibrant",
    serviceStyle: "Buffet & A la Carte",
    serviceHours: {
      breakfast: "6:30 a.m. to 11:00 a.m.",
      lunch: "11:30 a.m. to 5:00 p.m.",
      dinner: "6:00 p.m. to 10:30 p.m.",
    },
    eventtypes: [
      {
        title: "Annual General Meeting",
        image: "/images/conference.webp",
      },
      {
        title: "Boardroom Sessions",
        image: "/images/boardmeeting.webp",
      },
      {
        title: "Corporate Meetings",
        image: "/images/hallroom.webp",
      },
    ],
    reverse: false,
  },
  {
    id: "2",
    name: "Conference Hall",
    // type: "Hilltop Restaurant",
    description:
      "Spacious circular conference hall designed for large meetings, seminars, trainings, and corporate events with modern facilities...",
    images: [
      "/images/conference.webp",
      "/images/boardmeeting.webp",
      "/images/hallroom.webp",
    ],
    heroImage: "/images/conference.webp",
    cuisine: ["International", "Fast Casual", "Beverages"],
    atmosphere: "Casual & Vibrant",
    serviceStyle: "Buffet & A la Carte",
    serviceHours: {
      breakfast: "6:30 a.m. to 11:00 a.m.",
      lunch: "11:30 a.m. to 5:00 p.m.",
      dinner: "6:00 p.m. to 10:30 p.m.",
    },
    eventtypes: [
      {
        title: "Annual General Meeting",
        image: "/images/conference.webp",
      },
      {
        title: "Boardroom Sessions",
        image: "/images/boardmeeting.webp",
      },
      {
        title: "Corporate Meetings",
        image: "/images/hallroom.webp",
      },
    ],
    location: "Ground Floor",
    reverse: true,
  },
  {
    id: "3",
    name: "Training Room",
    // type: "Hilltop Restaurant",
    description:
      "Spacious circular conference hall designed for large meetings, seminars, trainings, and corporate events with modern facilities...",
    images: ["/images/trainingroom.webp", "/images/trainingroom.webp"],
    heroImage: "/images/conference.webp",
    cuisine: ["International", "Fast Casual", "Beverages"],
    atmosphere: "Casual & Vibrant",
    serviceStyle: "Buffet & A la Carte",
    serviceHours: {
      breakfast: "6:30 a.m. to 11:00 a.m.",
      lunch: "11:30 a.m. to 5:00 p.m.",
      dinner: "6:00 p.m. to 10:30 p.m.",
    },
    eventtypes: [
      {
        title: "Annual General Meeting",
        image: "/images/conference.webp",
      },
      {
        title: "Boardroom Sessions",
        image: "/images/boardmeeting.webp",
      },
      {
        title: "Corporate Meetings",
        image: "/images/hallroom.webp",
      },
    ],
    location: "Ground Floor",
    reverse: true,
  },
];

const MeetingsAndEvents = () => {
  const [selectedRoom, setSelectedRoom] = useState<{
    name: string;
    images: string[];
  } | null>(null);
  const [initialIndex, setInitialIndex] = useState(0);
  const {fetchApplication, application} = useApplication();

  const openModal = (images: string[], name: string, startIndex = 0) => {
    setSelectedRoom({ name, images });
    setInitialIndex(startIndex);
  };

  useEffect(()=>{
    if(!application) fetchApplication();
  },[])

  console.log("appplication all api", application)

  const closeModal = () => {
    setSelectedRoom(null);
  };

  return (
    <>
      {/* Hero Section */}
      <PageHero
        title="Meetings"
        subtitle="Discover comfort and style in our meetings and events."
        backgroundImage="/images/boardmeeting.webp"
      />

      {/* Rooms List */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 ">
          {Meetings.map((meeting) => (
            <ImageCardSlider
              key={meeting.id}
              {...meeting}
              onImageClick={openModal}
              buttonText="Find More"
              buttonHref={`/meetingsandevents/${meeting.id}`}
            />
          ))}
        </div>
      </section>

      <CallToAction
        title="Have Any Queries For Us?"
        description="Get all your questions answered, we are just one call away!"
        phone="01704199798"
      />

      {/* Modal */}
      {selectedRoom && (
        <ImageGalleryModal
          title={selectedRoom.name}
          images={selectedRoom.images}
          initialIndex={initialIndex}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default MeetingsAndEvents;
