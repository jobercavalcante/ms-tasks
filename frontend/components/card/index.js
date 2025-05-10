"use client";
import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useState, useEffect } from "react";
import authService from "@/services/authService";
import { toast, ToastContainer } from "react-toastify";

const Card = ({ title, description, id, reloadTasks, notify }) => {
  const [show, setShow] = useState(false);
  const [titulo, setTitulo] = useState(title);
  const [descricao, setDescricao] = useState(description);
  const [excluindo, setExcluindo] = useState(false);

  const handleClose = (keep = false) => {
    setShow(false);
    setTitulo(title);
    setDescricao(description);
  };
  const handleShow = () => setShow(true);

  const handleClickSalvarTarefa = async () => {
    try {
      // Chamar a API de salvar tarefa
      fetch("/api/task", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({
          title: titulo,
          description: descricao,
          id: id,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erro ao salvar a tarefa");
          }
          return response.json();
        })
        .then((data) => {
          notify("Tarefa salva com sucesso:", "success");
          reloadTasks(true);
          handleClose();
        });
    } catch (error) {
      notify("Erro ao salvar a tarefa:", "error");
    }
  };
  useEffect(() => {
    setTitulo(title);
    setDescricao(description);
  }, [title, description]);

  const handleClickExcluir = () => {
    setExcluindo(true);
    try {
      // Chamar a API de excluir tarefa
      fetch("/api/task", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({
          id: id,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            setExcluindo(false);
            throw new Error("Erro ao excluir a tarefa");
          }
          return response.json();
        })
        .then((data) => {
          setExcluindo(false);
          reloadTasks(true);
          notify("Tarefa excluída com sucesso:", data);
        })
        .catch((error) => {
          setExcluindo(false);
          notify("Erro ao excluir a tarefa:", "error");
        })
        .finally(() => {
          setExcluindo(false);
        });
    } catch (error) {
      setExcluindo(false);
      notify("Erro ao excluir a tarefa:", "error");
    }
  };
  const handleClickExcluirTarefa = () => {
    handleClickExcluir();
  };

  return (
    <>
      <div className="card  mb-3">
        <div className="card-header">{titulo}</div>
        <div className="card-body">
          <p className="card-text">{descricao}</p>
        </div>
        <div className="card-footer bg-transparent d-flex justify-content-end">
          <button className="btn btn-primary btn-sm " onClick={handleShow}>
            Editar
          </button>
          <button
            className="btn btn-danger ms-2 btn-sm"
            onClick={handleClickExcluirTarefa}
            disabled={excluindo}
          >
            {excluindo ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              "Excluir"
            )}
          </button>
        </div>
      </div>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Editar Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Titulo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Titulo aqui"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Descrição aqui"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleClickSalvarTarefa}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Card;
