import React, { useState, useEffect, useContext } from "react";
import GlobalContext from "../context/GlobalContext";
import backendconn from "../api/api";

export default function ServiceListModal() {
  const {
    showServiceListModal,
    setShowServiceListModal,
    setShowServiceModal,
    setShowEditServiceModal,
    setIsMsgService,
  } = useContext(GlobalContext);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await backendconn.get("/service");
        setServices(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    if (showServiceListModal) {
      fetchServices();
    }
  }, [showServiceListModal]);

  function handleEdit(id) {
    setShowEditServiceModal(id);
    setShowServiceListModal(false);
    return;
  }

  async function handleDelete(id) {
    backendconn
      .delete("/service/" + id)
      .then(function (response) {
        // handle success
        setIsMsgService([response.data]);
        setIsModalOpen();
        return;
      })
      .catch(function (error) {
        // handle error
        setIsMsgService([error.response.data]);
        setIsModalOpen(null);
        return;
      });
  }

  const setIsModalOpen = () => {
    setShowServiceListModal(false);
  };

  function handleOpenServiceModal() {
    setShowServiceModal(true);
    setShowServiceListModal(false);
    return;
  }

  return (
    <div
      className={`fixed z-50 top-0 left-0 w-full h-full overflow-auto bg-greensas bg-opacity-40 ${
        showServiceListModal ? "block" : "hidden"
      }`}
    >
      <div className="relative w-full max-w-6xl mx-auto mt-10">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 bg-greensas rounded-t-lg">
            <h3 className="text-lg font-medium text-white text-center	">
              Serviços
            </h3>
            <button
              className="print-hidden text-white hover:text-red-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
              onClick={setIsModalOpen}
            >
              <span className="material-icons-outlined cursor-pointer mx-2">
                close
              </span>
            </button>
          </div>
          <div className="px-4 py-3 overflow-x-auto">
            <table
              className="min-w-full divide-y divide-gray-200"
              id="print-table"
            >
              <thead>
                <tr className="bg-gray-50">
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-greensas uppercase tracking-wider"
                  >
                    Nome do Serviço
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-greensas uppercase tracking-wider"
                  >
                    Descrição do Serviço
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-greensas uppercase tracking-wider"
                  >
                    Preço do Serviço
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-greensas uppercase tracking-wider"
                  >
                    Duração do Serviço
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-greensas uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="print-hidden px-6 py-3 text-left text-xs font-medium text-greensas uppercase tracking-wider"
                  >
                    Editar
                  </th>
                  <th
                    scope="col"
                    className="print-hidden px-6 py-3 text-left text-xs font-medium text-greensas uppercase tracking-wider"
                  >
                    Excluir
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.length > 0 ? (
                  services.map((service) => (
                    <tr key={service._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.name}
                      </td>
                      <td className="px-6 py-4 whitespace-normal max-w-xs text-sm text-gray-500">
                        {service.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        R${" "}
                        {service.price.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            service.status
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {service.status ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="print-hidden text-indigo-600 hover:text-indigo-900"
                          onClick={() => handleEdit(service._id)}
                        >
                          <span className="sr-only">Editar</span>
                          <span className="material-icons-outlined cursor-pointer text-red mx-2">
                            edit
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="print-hidden text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(service._id)}
                        >
                          <span className="sr-only">Excluir</span>
                          <span className="material-icons-outlined cursor-pointer text-red mx-2">
                            delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>
                      <p className="text-gray-500 items-center">
                        Não há serviços cadastrados.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <footer className="print-hidden bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
              <button
                type="button"
                className="print-hidden w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-greensas text-base font-medium text-white hover:bg-white hover:text-greensas hover:border-greensas focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greensas sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => handleOpenServiceModal()}
              >
                Novo Serviço
              </button>
              <button
                type="button"
                className="print-hidden mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-greensas hover:bg-greensas hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greensas sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={setIsModalOpen}
              >
                Voltar
              </button>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
