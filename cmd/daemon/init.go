package daemon

import (
	"log"
	"net"
	"net/http"
	"os"

	"go.uber.org/zap"

	"gitlab.com/king011/webpc/configure"
	"gitlab.com/king011/webpc/logger"
)

// Run run as deamon
func Run() {
	cnf := configure.Single().HTTP
	l, e := net.Listen(`tcp`, cnf.Addr)
	if e != nil {
		if ce := logger.Logger.Check(zap.FatalLevel, `listen error`); ce != nil {
			ce.Write(
				zap.Error(e),
			)
		}
		os.Exit(1)
	}
	if cnf.TLS() {
		if ce := logger.Logger.Check(zap.InfoLevel, `https work`); ce != nil {
			ce.Write(
				zap.String(`addr`, cnf.Addr),
			)
		}
		if !logger.Logger.OutConsole() {
			log.Println(`https work`, cnf.Addr)
		}
	} else {
		if ce := logger.Logger.Check(zap.InfoLevel, `http work`); ce != nil {
			ce.Write(
				zap.String(`addr`, cnf.Addr),
			)
		}
		if !logger.Logger.OutConsole() {
			log.Println(`http work`, cnf.Addr)
		}
	}

	router := newGIN()

	if cnf.TLS() {
		e = http.ServeTLS(l, router, cnf.CertFile, cnf.KeyFile)
	} else {
		e = http.Serve(l, router)
	}
	if ce := logger.Logger.Check(zap.FatalLevel, `serve error`); ce != nil {
		ce.Write(
			zap.Error(e),
		)
	}
	os.Exit(1)
}
