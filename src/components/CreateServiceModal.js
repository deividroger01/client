import React, { useContext, useState } from "react";
import GlobalContext from "../context/GlobalContext";
import backendconn from "../api/api";

export default function CreateServiceModal() {
  const { showServiceModal, setShowServiceModal, setShowServiceListModal } =
    useContext(GlobalContext);

  /* Verificar useState dos serviços*/

  const [serviceName, setServiceName] = useState();
  const [servicePrice, setServicePrice] = useState();
  const [serviceDuration, setServiceDuration] = useState();
  const [serviceDescription, setServiceDescription] = useState();
  const [serviceStatus, setServiceStatus] = useState();

  const setIsModalOpen = () => {
    setShowServiceModal(false);
    setShowServiceListModal(true);
  };

  /* Verificar submit para o serviço*/
  async function handleSubmit(e) {
    e.preventDefault();
    backendconn
      .post("/service", {
        name: serviceName,
        price: servicePrice,
        duration: serviceDuration,
        description: serviceDescription,
        status: serviceStatus,
      })
      .then(function (response) {
        // handle success
        console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
    setIsModalOpen();
    return;
  }

  return (
    <div
      className={`fixed z-50 top-0 left-0 w-full h-full overflow-auto bg-greensas bg-opacity-40 ${
        showServiceModal ? "block" : "hidden"
      }`}
    >
      <div className="relative w-full max-w-6xl mx-auto mt-10">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 bg-greensas rounded-t-lg">
            <h3 className="text-lg font-medium text-white text-center	">
              Cadastro de Serviços
            </h3>
            <button
              className="text-white hover:text-red-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
              onClick={setIsModalOpen}
            >
              <span className="material-icons-outlined cursor-pointer mx-2">
                close
              </span>
            </button>
          </div>
          <form className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="name"
              >
                Nome do Serviço
              </label>
              <input
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                id="name"
                type="text"
                placeholder="Digite o nome do serviço"
                required={true}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="description"
              >
                Descrição do Serviço
              </label>
              <textarea
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                id="description"
                placeholder="Digite a descrição do serviço"
                rows="3"
                required={true}
                onChange={(e) => setServiceDescription(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="price"
              >
                Preço do Serviço
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">R$ </span>
                </div>
                <input
                  type="number"
                  name="service-price"
                  id="service-price"
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder=" 0,00"
                  required={true}
                  onChange={(e) => setServicePrice(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"></div>
              </div>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="duration"
              >
                Duração do Serviço
              </label>
              <input
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                id="duration"
                type="number"
                placeholder="Digite a duração do serviço (em minutos)"
                required={true}
                onChange={(e) => setServiceDuration(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="status"
              >
                Status do Serviço
              </label>
              <select
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                id="status"
                required={true}
                onChange={(e) => setServiceStatus(e.target.value)}
              >
                <option value={"Selecione o status"}>
                  -- Selecione o status --
                </option>
                <option value={true}>Ativo</option>
                <option value={false}>Inativo</option>
              </select>
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
