import React, { useContext, useState, useEffect } from "react";
import GlobalContext from "../context/GlobalContext";
import backendconn from "../api/api";
import dayjs from "dayjs";

export default function CreateEventModal() {
  const { setIsMsgEvent, showEventModal, setShowEventModal, daySelected } =
    useContext(GlobalContext);

  const [serviceInfo, setServiceInfo] = useState("");
  const [startTime, setStartTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [services, setServices] = useState([]);
  const [durantionSelectedService, setDurantionSelectedService] = useState("");
  const [idSelectedService, setIdSelectedService] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);

  /** Serviços */

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

    if (showEventModal) {
      fetchServices();
    }
  }, [showEventModal]);

  /**Horários disponíveis */

  const getBusyTimes = async (tMin, tMax) => {
    try {
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

  // pegar horários disponíveis
  const loadAvailableTimes = async () => {
    const tMin = daySelected
      .startOf("day")
      .format("YYYY-MM-DD[T]HH:mm:ss[-03:00]");
    const tMax = daySelected
      .startOf("day")
      .add(1, "day")
      .format("YYYY-MM-DD[T]HH:mm:ss[-03:00]");
    console.log("timeMin: ", tMin, " timeMax: ", tMax);
    const occupiedTimes = await getBusyTimes(tMin, tMax);
    const filteredTimes = filterAvailableTimes(occupiedTimes);
    setAvailableTimes(filteredTimes);
  };

  useEffect(() => {
    if (showEventModal) {
      loadAvailableTimes();
    }
  }, [daySelected, showEventModal]);

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
    setIdSelectedService(id);
    setServiceInfo(e.target.value);
  };

  /* Verificar submit para o agendamento*/
  async function handleSubmit(e) {
    e.preventDefault();

    const duration = durantionSelectedService;

    if (
      (startTime === undefined || startTime === "") &&
      (duration === undefined || duration === "")
    ) {
      setIsModalOpen();
      return;
    }

    if (
      (startTime === undefined || startTime === "") &&
      (duration !== undefined || duration !== "")
    ) {
      setIsModalOpen();
      return;
    }

    const id = idSelectedService;

    if (
      (startTime !== undefined || startTime !== "" || startTime !== 0) &&
      (duration !== undefined || duration !== "")
    ) {
      const convertedStartTime =
        daySelected.locale("pt-br").format("YYYY-MM-DD") +
        "T" +
        startTime +
        ":00-03:00";

      const startTimeDate = new Date(convertedStartTime);
      const durationMilliseconds = duration * 60000;

      const endTimeDate = new Date(
        startTimeDate.getTime() + durationMilliseconds
      );

      const timezoneOffset = endTimeDate.getTimezoneOffset() * 60000;
      const convertedEndTime = new Date(endTimeDate.getTime() - timezoneOffset)
        .toISOString()
        .replace(".000Z", "-03:00");

      backendconn
        .post("/event", {
          serviceInfo: serviceInfo,
          endTime: convertedEndTime,
          startTime: convertedStartTime,
          clientName: clientName,
          clientPhone: clientPhone,
          clientEmail: clientEmail,
        })
        .then(function (response) {
          // handle success
          const idEventCreated = response.data.response;

          backendconn
            .post("/scheduling", {
              eventId: idEventCreated,
              serviceId: id,
              endTime: convertedEndTime,
              startTime: convertedStartTime,
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
          setIsModalOpen();
        })
        .catch(function (error) {
          // handle error
          setIsMsgEvent([error.response.data]);
          setIsModalOpen(null);
          console.log(error);
        });

      setIsModalOpen();
      return;
    }
  }

  const setIsModalOpen = () => {
    setShowEventModal(false);
  };

  return (
    <div
      className={`fixed z-50 top-0 left-0 w-full h-full overflow-auto bg-greensas bg-opacity-40 ${
        showEventModal ? "block" : "hidden"
      }`}
    >
      <div className="relative w-full max-w-6xl mx-auto mt-10">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 bg-greensas rounded-t-lg">
            <h3 className="text-lg font-medium text-white text-center">
              Agendar Serviço
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

          <form className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
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
                      placeholder="Digite o nome do cliente"
                      required={true}
                      onChange={(e) => setClientName(e.target.value)}
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
                      placeholder="Digite número de telefone do cliente"
                      required={true}
                      pattern="^\d{10}$"
                      onChange={(e) => setClientPhone(e.target.value)}
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
                      placeholder="Digite o e-mail do cliente"
                      required={true}
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      onChange={(e) => setClientEmail(e.target.value)}
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
                  <label id="eventDate">
                    {daySelected
                      .locale("pt-br")
                      .format("dddd, DD [de] MMMM [de] YYYY")}
                  </label>
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
                    >
                      <option value="">Selecione um horário</option>
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
                      required={true}
                      value={serviceInfo}
                      onChange={handleServiceChange}
                    >
                      <option value={"Selecione o Serviço"}>
                        -- Selecione o Serviço --
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
                type="button"
                onClick={handleSubmit}
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
