import React, { useState, useEffect, useContext } from "react";
import GlobalContext from "../context/GlobalContext";
import backendconn from "../api/api";
import dayjs from "dayjs";

export default function EditEventModal() {
  const {
    setIsMsgEvent,
    showEditEventModal,
    setShowEditEventModal,
    setShowEventsModal,
    daySelected,
  } = useContext(GlobalContext);

  const initialValue = {
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    sTime: "",
    endTime: "",
    startTime: "",
    serviceInfo: "",
  };
  const [events, setEvents] = useState(initialValue);
  const [serviceInfo, setServiceInfo] = useState();
  const [startTime, setStartTime] = useState();
  const [clientName, setClientName] = useState();
  const [clientPhone, setClientPhone] = useState();
  const [clientEmail, setClientEmail] = useState();
  const [serviceId, setServiceId] = useState();
  const [eventDate, setEventDate] = useState();

  const [services, setServices] = useState([]);
  const [durantionSelectedService, setDurantionSelectedService] = useState("");

  const [availableTimes, setAvailableTimes] = useState([]);

  /* Verificar useState dos serviços*/

  const setIsModalOpen = () => {
    setShowEditEventModal(null);
    setShowEventsModal(true);
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await backendconn.get("/service");
        const allServices = response.data;
        const filteredServices = allServices.filter(
          (service) => service.status !== false
        );

        setServices(filteredServices);
      } catch (error) {
        console.error(error);
      }
    };

    if (showEditEventModal) {
      fetchServices();
    }
  }, [showEditEventModal]);

  useEffect(() => {
    if (showEditEventModal) {
      backendconn.get("/scheduling/" + showEditEventModal).then((response) => {
        let resStartTime = dayjs(response.data.startTime);
        const sTime = resStartTime.format("HH:mm");
        const eDate = resStartTime
          .locale("pt-br")
          .format("dddd, DD [de] MMMM [de] YYYY");
        const evtDate = resStartTime;

        // Encontrando o serviço correspondente ao serviceId
        const serviceId = response.data.serviceId;
        const selectedService = services.find(
          (service) => service._id === serviceId
        );

        // Verificando se o serviço foi encontrado
        if (selectedService) {
          const servName = selectedService.name;
          const servDuration = selectedService.duration;
          const servId = selectedService._id;
          const servInfo =
            selectedService.name +
            " - Preço: R$ " +
            selectedService.price +
            " - Duração: " +
            selectedService.duration +
            " minutos - Descrição: " +
            selectedService.description;

          const updatedEventData = {
            ...response.data,
            startTime: startTime,
            sTime: sTime,
            servInfo: servInfo,
            eDate: eDate,
            serviceInfo: servName,
            servId: servId,
            evtDate: evtDate,
          };
          console.log("updatedEventData: ", updatedEventData);
          setEvents(updatedEventData);
          setEventDate(evtDate);
          setServiceInfo(servName);
          setStartTime(response.data.startTime);
          setClientName(response.data.clientName);
          setClientPhone(response.data.clientPhone);
          setClientEmail(response.data.clientEmail);
          setDurantionSelectedService(servDuration);
          setServiceId(servId);
        }
      });
    }
  }, [showEditEventModal, services]);

  /** Serviços */

  /**Horários disponíveis */

  const getBusyTimes = async (tMin, tMax) => {
    try {
      console.log(tMin, tMax);
      const response = await backendconn.post("event/freebusy", {
        timeMin: tMin,
        timeMax: tMax,
      });
      return response.data.response;
    } catch (error) {
      console.error("Erro ao obter horários ocupados:", error);
      return [];
    }
  };

  // pegar horários disponíveis >>>>>>>>>>> CORRIGIR AQUI <<<<<<<<<<<<<<<<<<<<
  const loadAvailableTimes = async () => {
    const formatedEventDate = dayjs(eventDate);
    const tMin = formatedEventDate.format("YYYY-MM-DD[T00:00:00-03:00]");
    const tMax = formatedEventDate
      .add(1, "day")
      .format("YYYY-MM-DD[T00:00:00-03:00]");
    const occupiedTimes = await getBusyTimes(tMin, tMax);
    const filteredTimes = filterAvailableTimes(occupiedTimes);
    setAvailableTimes(filteredTimes);
  };

  useEffect(() => {
    if (showEditEventModal) {
      loadAvailableTimes();
    }
  }, [showEditEventModal]);

  const filterAvailableTimes = (occupiedTimes) => {
    const availableTimes = [];
    const initTime = daySelected.startOf("day").hour(0).minute(0).second(0);
    const finishTime = daySelected
      .startOf("day")
      .hour(23)
      .minute(59)
      .second(59);

    let currentTime = initTime;

    const isTimeOccupied = (occupiedTime) => {
      const start = dayjs(occupiedTime.start);
      const end = dayjs(occupiedTime.end);
      return (
        currentTime.isSame(start) ||
        (currentTime.isAfter(start) && currentTime.isBefore(end))
      );
    };

    while (currentTime.isBefore(finishTime)) {
      const time = currentTime.format("HH:mm");
      const occupied = occupiedTimes.some(isTimeOccupied);

      if (!occupied) {
        availableTimes.push(time);
      }

      currentTime = currentTime.add(30, "minute");
    }

    return availableTimes;
  };

  const handleServiceChange = (e) => {
    e.preventDefault();
    const selectedService = services.find(
      (service) => service.name === e.target.value
    );

    const duration = selectedService.duration;
    const id = selectedService._id;

    setDurantionSelectedService(duration);
    setServiceId(id);
    setServiceInfo(e.target.value);
  };

  if (startTime && startTime.length < 6) {
    const convertedStartTime =
      eventDate.locale("pt-br").format("YYYY-MM-DD") +
      "T" +
      startTime +
      ":00-03:00";
    setStartTime(convertedStartTime);
  }

  async function onSubmit(e) {
    e.preventDefault();

    console.log(
      "eventId: ",
      events.eventId,
      "serviceInfo: ",
      serviceInfo,
      "clientName: ",
      clientName,
      "clientPhone: ",
      clientPhone,
      "clientEmail: ",
      clientEmail,
      "serviceId: ",
      serviceId,
      "startTime: ",
      startTime
    );

    const duration = durantionSelectedService;

    console.log(
      "eventId: ",
      events.eventId,
      "serviceInfo: ",
      serviceInfo,
      "clientName: ",
      clientName,
      "clientPhone: ",
      clientPhone,
      "clientEmail: ",
      clientEmail,
      "serviceId: ",
      serviceId,
      "startTime: ",
      startTime
    );

    const startTimeDate = new Date(startTime);
    const durationMilliseconds = duration * 60000;

    const endTimeDate = new Date(
      startTimeDate.getTime() + durationMilliseconds
    );

    const timezoneOffset = endTimeDate.getTimezoneOffset() * 60000;
    const convertedEndTime = new Date(endTimeDate.getTime() - timezoneOffset)
      .toISOString()
      .replace(".000Z", "-03:00");

    console.log(
      "eventId: ",
      events.eventId,
      "serviceInfo: ",
      serviceInfo,
      "clientName: ",
      clientName,
      "clientPhone: ",
      clientPhone,
      "clientEmail: ",
      clientEmail,
      "serviceId: ",
      serviceId,
      "endTime: ",
      convertedEndTime,
      "startTime: ",
      startTime
    );

    backendconn
      .put("/event/" + events.eventId, {
        eventId: events.eventId,
        serviceInfo: serviceInfo,
        endTime: convertedEndTime,
        startTime: startTime,
        clientName: clientName,
        clientPhone: clientPhone,
        clientEmail: clientEmail,
      })
      .then(function (response) {
        // handle success
        const idEventCreated = response.data.response;

        backendconn
          .put("/scheduling/" + showEditEventModal, {
            eventId: idEventCreated,
            serviceId: serviceId,
            endTime: convertedEndTime,
            startTime: startTime,
            clientName: clientName,
            clientPhone: clientPhone,
            clientEmail: clientEmail,
          })
          .then(function (response) {
            //OK
          })
          .catch(function (error) {
            // Se erro
            console.log(error);
          });

        setIsMsgEvent([response.data]);
        setTimeout(() => {
          setIsModalOpen();
        }, 5000);
      })
      .catch(function (error) {
        // handle error
        setIsMsgEvent([error.response.data]);
        setTimeout(() => {
          setIsModalOpen(null);
        }, 3000);
        console.log(error);
      });

    setIsModalOpen();
    return;
  }

  return (
    <div
      className={`fixed z-50 top-0 left-0 w-full h-full overflow-auto bg-greensas bg-opacity-40 ${
        showEditEventModal ? "block" : "hidden"
      }`}
    >
      <div className="relative w-full max-w-6xl mx-auto mt-10">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 bg-greensas rounded-t-lg">
            <h3 className="text-lg font-medium text-white text-center">
              Atualizar Agendamento
            </h3>
            <button
              type="button"
              className="text-white hover:text-red-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
              onClick={setIsModalOpen}
            >
              <span className="material-icons-outlined cursor-pointer mx-2">
                close
              </span>
            </button>
          </div>
          <form
            className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4"
            onSubmit={onSubmit}
          >
            <div className="flex flex-wrap">
              <div className="w-full md:w-1/2  pr-4">
                <div className="mb-4">
                  <label
                    className="block text-gray-700 font-bold mb-2"
                    htmlFor="clientName"
                  >
                    Nome do Cliente
                  </label>
                  <div className="relative">
                    <input
                      className="focus:ring-green-500 focus:border-green-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      id="clientName"
                      type="text"
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={events.clientName}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 font-bold mb-2"
                    htmlFor="clientPhone"
                  >
                    Telefone do cliente
                  </label>
                  <div className="relative">
                    <input
                      className="focus:ring-green-500 focus:border-green-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      id="clientPhone"
                      type="number"
                      pattern="^\d{10}$"
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder={events.clientPhone}
                    />
                    <p className="text-xs text-gray-500">
                      Insira um número de telefone válido.
                    </p>
                  </div>
                </div>
                <div className="relative mb-4">
                  <label
                    className="block text-gray-700 font-bold mb-2"
                    htmlFor="clientEmail"
                  >
                    E-mail do Cliente
                  </label>
                  <div className="relative">
                    <input
                      className="focus:ring-green-500 focus:border-green-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      id="clientEmail"
                      type="email"
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder={events.clientEmail}
                    />
                    <p className="text-xs text-gray-500">
                      Insira um endereço de e-mail válido.
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 pl-4">
                <div className="mb-4">
                  <label
                    className="block text-gray-700 font-bold mb-2"
                    htmlFor="eventDate"
                  >
                    Data do agendamento
                  </label>
                  <label id="eventDate">{events.eDate}</label>
                </div>
                <div className="relative mb-4">
                  <label
                    className="block text-gray-700 font-bold mb-2"
                    htmlFor="startTime"
                  >
                    Horários de início disponíveis
                  </label>
                  <div className="relative">
                    <select
                      className="block w-full mt-1 pl-3 pr-10 py-2 border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder={events.sTime}
                    >
                      <option value="">{events.sTime}</option>
                      {availableTimes.map((horario) => (
                        <option key={horario} value={horario}>
                          {horario}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 font-bold mb-2"
                    htmlFor="serviceInfo"
                  >
                    Serviço
                  </label>
                  {services.length > 0 ? (
                    <select
                      className="focus:ring-green-500 focus:border-green-500 block w-full pl-3 pr-10 py-2 sm:text-sm border-gray-300 rounded-md appearance-none overflow-scroll"
                      id="serviceInfo"
                      onChange={handleServiceChange}
                      placeholder={events.servInfo}
                    >
                      <option value={"Selecione o Serviço"}>
                        {events.servInfo}
                      </option>
                      {services.map((service) => (
                        <option
                          key={service._id}
                          value={service.name}
                          className="py-1 w-full"
                        >
                          {service.name} - Preço: R$ {service.price} - Duração:{" "}
                          {service.duration} minutos - Descrição:{" "}
                          {service.description}
                        </option>
                      ))}
                    </select>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
            <footer className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
              <button
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-greensas text-base font-medium text-white hover:bg-white hover:text-greensas hover:border-greensas focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greensas sm:ml-3 sm:w-auto sm:text-sm"
                type="submit"
              >
                Salvar
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-greensas hover:bg-greensas hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greensas sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={setIsModalOpen}
              >
                Voltar
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}
